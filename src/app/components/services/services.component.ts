import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { attachModalAwareWheel } from '../../core/modal-aware-wheel';
import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TranslationService } from '../../services/translation.service';

interface ServiceItem {
  number: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  iconType: 'shield' | 'network' | 'software' | 'infra' | 'training';
  /** Copy for the three floating dashboard panels overlaid on this
   *  service's visual — illustrative metrics only, not live data. */
  panelTopLabel: string;
  panelTopValue: string;
  panelStatLabel: string;
  panelStatValue: string;
  panelStatTrend: string;
}

/** How many viewport-heights of scroll distance each stage gets. Kept
 *  short enough that the showcase feels responsive to scroll input rather
 *  than sluggish, while still giving each stage a deliberate dwell. */
const STAGE_VH = 50;
/** Fixed navbar height (see navbar.component.css) — the sticky showcase
 *  pins just below it, and scroll progress is measured from this offset. */
const HEADER_OFFSET = 74;

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [SectionHeadingComponent, CommonModule, ScrollRevealDirective],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  public ts = inject(TranslationService);
  private scrollerRef = viewChild<ElementRef<HTMLElement>>('scroller');
  private stickyRef = viewChild<ElementRef<HTMLElement>>('sticky');

  /** The pinned panel is now only as tall as its own content (no more
   *  full-viewport box with empty space above/below it). These two values
   *  are measured from the DOM and drive the layout:
   *   - stickyHeight: the panel's real rendered height
   *   - viewportH:    window.innerHeight
   *  The panel pins vertically centred in the area under the navbar, and
   *  the scroller is exactly panel height + scroll distance for the stages,
   *  so there is no blank band before the panel or after it releases. */
  private stickyHeight = signal(0);
  private viewportH = signal(typeof window !== 'undefined' ? window.innerHeight : 800);

  stickyTop = computed(() => {
    const free = this.viewportH() - HEADER_OFFSET - this.stickyHeight();
    return HEADER_OFFSET + Math.max(0, Math.round(free / 2));
  });

  /** Scroll distance (px) spent moving through all the stages. */
  private stageRange = computed(() => this.services().length * (STAGE_VH / 100) * this.viewportH());

  scrollerHeightPx = computed(() => Math.round(this.stickyHeight() + this.stageRange()));
  private resizeObs: ResizeObserver | null = null;

  services = computed<ServiceItem[]>(() => {
    const ar = this.ts.currentLang() === 'ar';
    return [
      {
        number: '01',
        title: this.ts.t('services.item1.title'),
        description: this.ts.t('services.item1.desc'),
        linkText: ar ? 'استكشف خدمات الأمن السيبراني' : 'Explore Cybersecurity',
        linkUrl: '#contact',
        iconType: 'shield' as const,
        panelTopLabel: ar ? 'حالة الأمان' : 'Security Status',
        panelTopValue: ar ? 'محمي' : 'Protected',
        panelStatLabel: ar ? 'تهديدات تم صدها' : 'Threats Blocked',
        panelStatValue: '2.4K',
        panelStatTrend: '12%'
      },
      {
        number: '02',
        title: this.ts.t('services.item2.title'),
        description: this.ts.t('services.item2.desc'),
        linkText: ar ? 'استكشف حلول الشبكات' : 'Explore Networking',
        linkUrl: '#contact',
        iconType: 'network' as const,
        panelTopLabel: ar ? 'حالة الشبكة' : 'Network Status',
        panelTopValue: ar ? 'متصلة' : 'Online',
        panelStatLabel: ar ? 'وقت التشغيل' : 'Uptime',
        panelStatValue: '99.9%',
        panelStatTrend: '0.4%'
      },
      {
        number: '03',
        title: this.ts.t('services.item3.title'),
        description: this.ts.t('services.item3.desc'),
        linkText: ar ? 'ابدأ مشروعك البرمجي' : 'Build Your Solution',
        linkUrl: '#contact',
        iconType: 'software' as const,
        panelTopLabel: ar ? 'حالة البناء' : 'Build Status',
        panelTopValue: ar ? 'ناجح' : 'Passing',
        panelStatLabel: ar ? 'عمليات النشر' : 'Deployments',
        panelStatValue: '128',
        panelStatTrend: '18%'
      },
      {
        number: '04',
        title: this.ts.t('services.item4.title'),
        description: this.ts.t('services.item4.desc'),
        linkText: ar ? 'تطوير البنية التحتية' : 'Optimize Infrastructure',
        linkUrl: '#contact',
        iconType: 'infra' as const,
        panelTopLabel: ar ? 'حالة النظام' : 'System Status',
        panelTopValue: ar ? 'متصل' : 'Online',
        panelStatLabel: ar ? 'وقت التشغيل' : 'Uptime',
        panelStatValue: '99.98%',
        panelStatTrend: '0.1%'
      },
      {
        number: '05',
        title: this.ts.t('services.item5.title'),
        description: this.ts.t('services.item5.desc'),
        linkText: ar ? 'عرض البرامج التدريبية' : 'View Training Programs',
        linkUrl: '#contact',
        iconType: 'training' as const,
        panelTopLabel: ar ? 'الشهادة' : 'Certification',
        panelTopValue: ar ? 'صادرة' : 'Issued',
        panelStatLabel: ar ? 'نسبة الإتمام' : 'Completion Rate',
        panelStatValue: '94%',
        panelStatTrend: '6%'
      }
    ];
  });


  /** 0-or-1 array wrapper keyed by the active service — lets the template
   *  remount the stage content on every change (same trick used by the
   *  News Journey timeline) so its fade/slide entrance replays. */
  activeArr = computed(() => {
    const list = this.services();
    const item = list[Math.min(this.activeIndex(), list.length - 1)];
    return item ? [item] : [];
  });

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  // ── Active stage is derived from scroll position — no autoplay timer.
  //    A rAF-throttled native `scroll` listener reads the sticky
  //    scroller's bounding box at most once per frame, and native CSS
  //    `position: sticky` handles the pin/release itself. While the panel
  //    is pinned (desktop/tablet only), a `wheel` listener turns each
  //    scroll gesture into exactly one stage jump — see handleWheel(). ──
  activeIndex = signal(0);
  private destroyRef = inject(DestroyRef);
  private rafHandle: number | null = null;
  /** Cached on resize only (instead of every scroll frame) so the hot
   *  scroll path does a single forced-layout read (getBoundingClientRect)
   *  per frame rather than two — the main lever for keeping scroll smooth. */
  private cachedOffsetHeight = 0;
  private boundOnScroll = () => this.scheduleUpdate();
  private boundOnResize = () => {
    this.refreshCachedHeight();
    this.scheduleUpdate();
  };
  /** Set while a nav click is smooth-scrolling the page to a stage, so the
   *  clicked item reads as active immediately instead of lagging behind
   *  the animation by a frame or two. Scroll handling still runs and will
   *  simply confirm the same index once the scroll finishes. */
  private pendingClickIndex: number | null = null;
  /** True while a wheel-triggered stage jump is animating — blocks further
   *  wheel input so one scroll gesture reliably lands on exactly one
   *  stage instead of a partial scroll the user has to repeat. */
  private wheelLocked = false;
  private boundOnWheel = (e: WheelEvent) => this.handleWheel(e);
  private detachWheel: (() => void) | null = null;

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  private refreshCachedHeight(): void {
    if (typeof window !== 'undefined') this.viewportH.set(window.innerHeight);
    const sticky = this.stickyRef()?.nativeElement;
    if (sticky) this.stickyHeight.set(sticky.offsetHeight);
    const el = this.scrollerRef()?.nativeElement;
    if (el) this.cachedOffsetHeight = el.offsetHeight;
  }

  /** Scroll range over which the panel stays pinned. */
  private pinnedRange(): number {
    // scroller height = panel height + stageRange, so the pinned range is
    // exactly stageRange — read from signals, never from a stale DOM value.
    return Math.max(0, this.stageRange());
  }

  private scheduleUpdate(): void {
    if (this.rafHandle !== null) return;
    this.rafHandle = requestAnimationFrame(() => {
      this.rafHandle = null;
      this.updateActiveFromScroll();
    });
  }

  private updateActiveFromScroll(): void {
    const el = this.scrollerRef()?.nativeElement;
    if (!el || typeof window === 'undefined') return;

    // Only getBoundingClientRect() is read on the hot path — offsetHeight
    // is cached on resize since it never changes mid-scroll.
    const rect = el.getBoundingClientRect();
    const scrollableRange = this.pinnedRange();
    const len = this.services().length;

    let idx: number;
    if (scrollableRange <= 0 || len <= 1) {
      idx = 0;
    } else {
      const scrolledPx = this.stickyTop() - rect.top;
      const clamped = Math.min(Math.max(scrolledPx, 0), scrollableRange);
      const frac = clamped / scrollableRange;
      idx = Math.min(len - 1, Math.floor(frac * len));
    }

    if (this.pendingClickIndex !== null) {
      // Once native scroll catches up to within a stage of the target,
      // hand control back to the scroll-derived index.
      if (idx === this.pendingClickIndex) this.pendingClickIndex = null;
      else return;
    }

    if (idx !== this.activeIndex()) this.activeIndex.set(idx);
  }

  /** Only on desktop/tablet widths is the showcase actually pinned
   *  (position: sticky) — below 1100px it's a plain stacked block, so
   *  wheel pagination has nothing to take over there; native scroll is
   *  left entirely alone on mobile. */
  private isPinnedLayout(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(min-width: 1101px)').matches;
  }

  /** Makes one wheel gesture move exactly one stage instead of a partial
   *  scroll the visitor has to repeat. While the pinned panel is on
   *  screen, each wheel tick is turned into a single smooth jump to the
   *  next/previous stage (reusing jumpToService) and further input is
   *  briefly locked out so a long trackpad swipe doesn't skip stages.
   *  Scrolling past the first or last stage releases back to native
   *  scroll so the page keeps moving into the surrounding sections. */
  private handleWheel(e: WheelEvent): void {
    // A pop-up is open (project / news / dialog): the wheel belongs to the
    // pop-up — never scroll the page behind it.
    if (document.body.classList.contains('kp-modal-open')) return;

    if (!this.isPinnedLayout()) return;
    const el = this.scrollerRef()?.nativeElement;
    if (!el || typeof window === 'undefined') return;
    const len = this.services().length;
    if (len <= 1) return;

    const rect = el.getBoundingClientRect();
    const scrollableRange = this.pinnedRange();
    if (scrollableRange <= 0) return;

    const scrolledPx = this.stickyTop() - rect.top;
    // Only take over once the pinned panel is actually in view — leave
    // scroll alone before it arrives and after it releases.
    if (scrolledPx < -4 || scrolledPx > scrollableRange + 4) return;

    e.preventDefault();
    if (this.wheelLocked) return;

    const dir = e.deltaY > 0 ? 1 : -1;
    const nextIndex = this.activeIndex() + dir;
    const lockMs = this.prefersReducedMotion() ? 80 : 550;

    if (nextIndex < 0 || nextIndex > len - 1) {
      // Past either end — nudge scroll on through so the sticky panel
      // releases naturally into the previous/next page section.
      this.wheelLocked = true;
      window.scrollTo({
        top: window.scrollY + dir * (window.innerHeight - HEADER_OFFSET) * 0.6,
        behavior: this.prefersReducedMotion() ? 'auto' : 'smooth'
      });
      window.setTimeout(() => { this.wheelLocked = false; }, lockMs);
      return;
    }

    this.wheelLocked = true;
    this.jumpToService(nextIndex);
    window.setTimeout(() => { this.wheelLocked = false; }, lockMs);
  }

  /** Clicking a nav entry smooth-scrolls (or jumps, under reduced motion)
   *  to that stage's band within the scroller. */
  jumpToService(i: number): void {
    const el = this.scrollerRef()?.nativeElement;
    if (!el || typeof window === 'undefined') return;
    const len = this.services().length;

    this.pendingClickIndex = i;
    this.activeIndex.set(i);

    const scrollableRange = this.pinnedRange();
    const stageStart = window.scrollY + el.getBoundingClientRect().top - this.stickyTop();
    // Land mid-band so the computed index matches immediately rather than
    // sitting exactly on a boundary.
    const targetWithinRange = scrollableRange <= 0 ? 0 : ((i + 0.5) / len) * scrollableRange;
    const targetY = Math.max(0, stageStart + targetWithinRange);

    window.scrollTo({ top: targetY, behavior: this.prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle);
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', this.boundOnScroll);
        window.removeEventListener('resize', this.boundOnResize);
        this.detachWheel?.();
      }
      this.resizeObs?.disconnect();
    });

    afterNextRender(() => {
      if (typeof window === 'undefined') return;
      this.refreshCachedHeight();
      window.addEventListener('scroll', this.boundOnScroll, { passive: true });
      window.addEventListener('resize', this.boundOnResize, { passive: true });
      // Not passive — handleWheel calls preventDefault() while the panel
      // is pinned. Detached automatically while a pop-up is open so it
      // can't slow down scrolling inside the pop-up.
      this.detachWheel = attachModalAwareWheel(this.boundOnWheel);
      // Re-measure whenever the panel's own height changes (fonts loading,
      // language switch, breakpoint change) so the scroller always hugs it.
      const sticky = this.stickyRef()?.nativeElement;
      if (sticky && 'ResizeObserver' in window) {
        this.resizeObs = new ResizeObserver(() => {
          this.refreshCachedHeight();
          // scroller height updates via signal on the next render — read it again after that
          requestAnimationFrame(() => { this.refreshCachedHeight(); this.scheduleUpdate(); });
        });
        this.resizeObs.observe(sticky);
      }
      requestAnimationFrame(() => { this.refreshCachedHeight(); this.updateActiveFromScroll(); });
      this.updateActiveFromScroll();
    });
  }
}
