import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { attachModalAwareWheel } from '../../core/modal-aware-wheel';
import { Component, DestroyRef, ElementRef, HostListener, afterNextRender, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { AuthService } from '../../services/auth.service';
import { NewsService } from '../../services/news.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { NewsDetail, NewsItem } from '../../models/content.models';
import { extractApiError } from '../../core/api-error';
import { thumbUrl } from '../../core/image-url';
import { NewsFormComponent } from '../news-form/news-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

/** Items shown in the timeline at once — the compact dated list on the left
 *  shows up to this many entries; "Next Stories" pages to the next fixed
 *  group once there are more than this many. */
const GROUP_SIZE = 3;
const ALL_NEWS_PAGE_SIZE = 9;
/** Scroll distance (in % of the viewport height) given to each story while
 *  the news block is pinned — same feel as the Capabilities section. */
const STORY_VH = 50;
/** Fixed navbar height (see navbar.component.css). */
const HEADER_OFFSET = 74;

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [SectionHeadingComponent, ScrollRevealDirective, NewsFormComponent, ConfirmDialogComponent],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent {
  ts = inject(TranslationService);
  auth = inject(AuthService);
  private api = inject(NewsService);
  private toast = inject(ToastService);

  items = signal<NewsItem[]>([]);
  loading = signal(true);
  failed = signal(false);
  skeletons = [1, 2, 3];

  // ───────── News Journey Timeline ─────────

  /** All items, newest first. The data already comes from the API in a sensible order,
   *  but we sort explicitly by publishedAt so the timeline's order is well-defined even
   *  if that ever changes. */
  sortedItems = computed(() => {
    return [...this.items()].sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
  });

  /** sortedItems() split into fixed, non-overlapping groups of 3 — what the "Next
   *  Stories" control pages through. Deterministic (no randomization), so paging
   *  forward never repeats a story until every group has been shown once. */
  groups = computed(() => {
    const list = this.sortedItems();
    const out: NewsItem[][] = [];
    for (let i = 0; i < list.length; i += GROUP_SIZE) out.push(list.slice(i, i + GROUP_SIZE));
    return out;
  });

  hasMultipleGroups = computed(() => this.groups().length > 1);

  /** Which fixed group of up to GROUP_SIZE items the left timeline column
   *  currently shows. "Next Stories" pages to the next group; nothing here
   *  auto-advances on its own. */
  groupIndex = signal(0);
  activeGroup = computed(() => {
    const g = this.groups();
    if (!g.length) return [] as NewsItem[];
    return g[Math.min(this.groupIndex(), g.length - 1)];
  });

  /** Which entry within the current group is loaded into the big feature
   *  panel on the right. Reset to the first entry whenever the group changes. */
  selectedInGroup = signal(0);
  activeStory = computed(() => {
    const g = this.activeGroup();
    if (!g.length) return null;
    return g[Math.min(this.selectedInGroup(), g.length - 1)];
  });

  /** 0-or-1 array wrapper keyed by the active story — lets the template
   *  remount the feature panel on every change so its fade/slide entrance
   *  replays instead of just swapping content in place. */
  activeStoryArr = computed(() => {
    const s = this.activeStory();
    return s ? [s] : [];
  });

  /** Click a timeline entry: goes to that story (scrolls to its stage when pinned). */
  selectStory(i: number): void {
    this.goToStory(this.groupIndex() * GROUP_SIZE + i);
  }

  /** "Next Stories": goes to the first story of the next group, wrapping around. */
  nextGroup(): void {
    const total = this.groups().length;
    if (total < 2) return;
    const g = (this.groupIndex() + 1) % total;
    this.goToStory(g * GROUP_SIZE);
  }

  /** Shows the story at this position in publish order (also pages the
   *  timeline to the group that contains it). */
  private jumpToFlatIndex(flatIdx: number): void {
    const g = Math.floor(flatIdx / GROUP_SIZE);
    if (g !== this.groupIndex()) this.groupIndex.set(g);
    const sel = flatIdx - g * GROUP_SIZE;
    if (sel !== this.selectedInGroup()) this.selectedInGroup.set(sel);
  }

  private currentFlatIndex(): number {
    return this.groupIndex() * GROUP_SIZE + this.selectedInGroup();
  }

  nextStory(): void {
    const len = this.sortedItems().length;
    if (len < 2) return;
    this.goToStory((this.currentFlatIndex() + 1) % len);
  }

  prevStory(): void {
    const len = this.sortedItems().length;
    if (len < 2) return;
    this.goToStory((this.currentFlatIndex() - 1 + len) % len);
  }

  // ───────── Scroll-driven stories (same model as the Capabilities section) ─────────

  // ───────── Fit each timeline panel: full title, as much description as fits ─────────

  private timelineColRef = viewChild<ElementRef<HTMLElement>>('timelineCol');
  private colObs: ResizeObserver | null = null;
  private observedCol: HTMLElement | null = null;

  /** For every panel in the timeline: keep the title whole and trim the
   *  description to the number of WHOLE lines that still fit (hiding it if
   *  not even one does), so nothing is ever cut in half. */
  private fitTimeline(): void {
    const col = this.timelineColRef()?.nativeElement;
    if (!col) return;
    const desktop = !!window.matchMedia?.('(min-width: 861px)').matches;

    col.querySelectorAll<HTMLElement>('.timeline-content').forEach(panel => {
      const ex = panel.querySelector<HTMLElement>('.timeline-excerpt');
      if (!ex) return;
      // back to the CSS defaults before measuring
      ex.style.removeProperty('-webkit-line-clamp');
      ex.style.removeProperty('line-clamp');
      ex.style.removeProperty('display');
      if (!desktop) return; // stacked layout: panels grow with their text

      const cs = getComputedStyle(panel);
      const inner = panel.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const gap = parseFloat(cs.rowGap) || 0;

      let used = 0;
      let shown = 0;
      Array.from(panel.children).forEach(child => {
        const el = child as HTMLElement;
        if (el === ex || el.classList.contains('timeline-thumb')) return; // the photo only takes what's left
        if (getComputedStyle(el).display === 'none') return;
        used += el.offsetHeight;
        shown++;
      });
      used += gap * shown; // gaps between the shown items, incl. the one before the description

      const exCs = getComputedStyle(ex);
      const lh = parseFloat(exCs.lineHeight) || 22;
      const cssMax = parseInt(exCs.getPropertyValue('-webkit-line-clamp'), 10) || 3;
      const lines = Math.min(cssMax, Math.floor((inner - used) / lh));

      if (lines <= 0) {
        ex.style.display = 'none';
      } else if (lines < cssMax) {
        ex.style.setProperty('-webkit-line-clamp', String(lines));
        ex.style.setProperty('line-clamp', String(lines));
      }
    });
  }

  private scheduleFit(): void {
    if (typeof window === 'undefined') return;
    requestAnimationFrame(() => this.fitTimeline());
  }

  private scrollerRef = viewChild<ElementRef<HTMLElement>>('scroller');
  private stickyRef = viewChild<ElementRef<HTMLElement>>('sticky');
  private destroyRef = inject(DestroyRef);

  private stickyHeight = signal(0);
  private viewportH = signal(typeof window !== 'undefined' ? window.innerHeight : 800);
  private isDesktop = signal(false);

  /** Pinned only on desktop, only with 2+ stories, and only when the panel
   *  actually fits on screen under the navbar (otherwise part of it would be
   *  unreachable while pinned, so it falls back to normal scrolling). */
  pinned = computed(() =>
    this.isDesktop() &&
    this.sortedItems().length > 1 &&
    this.stickyHeight() > 0 &&
    this.stickyHeight() <= this.viewportH() - HEADER_OFFSET
  );

  stickyTop = computed(() => {
    const free = this.viewportH() - HEADER_OFFSET - this.stickyHeight();
    return HEADER_OFFSET + Math.max(0, Math.round(free / 2));
  });

  private stageRange = computed(() => this.sortedItems().length * (STORY_VH / 100) * this.viewportH());
  scrollerHeightPx = computed(() => Math.round(this.stickyHeight() + this.stageRange()));

  private rafHandle: number | null = null;
  private resizeObs: ResizeObserver | null = null;
  private observedSticky: HTMLElement | null = null;
  /** Set while a click is smooth-scrolling to a story, so the clicked story
   *  shows immediately instead of flicking through the ones in between. */
  private pendingIndex: number | null = null;
  private wheelLocked = false;

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  private measure(): void {
    if (typeof window === 'undefined') return;
    this.viewportH.set(window.innerHeight);
    this.isDesktop.set(!!window.matchMedia?.('(min-width: 861px)').matches);
    const sticky = this.stickyRef()?.nativeElement;
    if (sticky) this.stickyHeight.set(sticky.offsetHeight);
  }

  private scheduleUpdate(): void {
    if (this.rafHandle !== null) return;
    this.rafHandle = requestAnimationFrame(() => {
      this.rafHandle = null;
      this.updateFromScroll();
    });
  }

  /** Where we are inside the pinned range, in px (can be <0 before / >range after). */
  private scrolledPx(): number | null {
    const el = this.scrollerRef()?.nativeElement;
    if (!el) return null;
    return this.stickyTop() - el.getBoundingClientRect().top;
  }

  private updateFromScroll(): void {
    if (!this.pinned()) return;
    const len = this.sortedItems().length;
    const range = this.stageRange();
    const scrolled = this.scrolledPx();
    if (scrolled === null || range <= 0) return;

    const clamped = Math.min(Math.max(scrolled, 0), range);
    const idx = Math.min(len - 1, Math.floor((clamped / range) * len));

    if (this.pendingIndex !== null) {
      if (idx === this.pendingIndex) this.pendingIndex = null;
      else return;
    }
    if (idx !== this.currentFlatIndex()) this.jumpToFlatIndex(idx);
  }

  /** Go to a story. When pinned this scrolls the page to that story's stage
   *  (so scroll position and the shown story always agree); otherwise it
   *  just switches the story in place. */
  goToStory(flatIdx: number): void {
    const len = this.sortedItems().length;
    if (!len) return;
    flatIdx = Math.min(Math.max(flatIdx, 0), len - 1);

    const el = this.scrollerRef()?.nativeElement;
    if (!this.pinned() || !el || typeof window === 'undefined') {
      this.jumpToFlatIndex(flatIdx);
      return;
    }

    this.pendingIndex = flatIdx;
    this.jumpToFlatIndex(flatIdx);
    const start = window.scrollY + el.getBoundingClientRect().top - this.stickyTop();
    const target = start + ((flatIdx + 0.5) / len) * this.stageRange();
    window.scrollTo({ top: Math.max(0, target), behavior: this.prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  /** One wheel gesture = exactly one story while the block is pinned (same as
   *  Capabilities). Past the first/last story, scrolling continues normally. */
  private onWheel = (e: WheelEvent) => {
    if (!this.pinned() || this.allNewsOpen() || this.viewing() || this.formOpen()) return;
    // Any pop-up open (e.g. a project): never scroll the page behind it.
    if (document.body.classList.contains('kp-modal-open')) return;
    const len = this.sortedItems().length;
    const range = this.stageRange();
    const scrolled = this.scrolledPx();
    if (scrolled === null || range <= 0) return;
    if (scrolled < -4 || scrolled > range + 4) return;

    const dir = e.deltaY > 0 ? 1 : -1;
    const next = this.currentFlatIndex() + dir;
    if (next < 0 || next > len - 1) return; // let the page scroll on past the block

    e.preventDefault();
    if (this.wheelLocked) return;
    this.wheelLocked = true;
    this.goToStory(next);
    window.setTimeout(() => { this.wheelLocked = false; }, this.prefersReducedMotion() ? 80 : 550);
  };

  private detachWheel: (() => void) | null = null;
  private onScroll = () => this.scheduleUpdate();
  private onResize = () => { this.measure(); this.scheduleUpdate(); };

  // ───────── View All News ─────────
  allNewsOpen = signal(false);
  allVisibleCount = signal(ALL_NEWS_PAGE_SIZE);
  allVisible = computed(() => this.sortedItems().slice(0, this.allVisibleCount()));

  openAllNews(): void {
    this.allVisibleCount.set(ALL_NEWS_PAGE_SIZE);
    this.allNewsOpen.set(true);
    document.body.classList.add('kp-modal-open');
  }

  closeAllNews(): void {
    this.allNewsOpen.set(false);
    document.body.classList.remove('kp-modal-open');
  }

  loadMoreAll(): void { this.allVisibleCount.update(c => c + ALL_NEWS_PAGE_SIZE); }

  // form modal
  formOpen = signal(false);
  editing = signal<NewsDetail | null>(null);
  loadingEditId = signal<number | null>(null);

  // delete confirmation
  deleting = signal<NewsItem | null>(null);
  deleteBusy = signal(false);

  // read-only details modal
  viewing = signal<NewsItem | null>(null);
  viewDetail = signal<NewsDetail | null>(null);

  private requestSeq = 0;

  constructor() {
    // Runs on init AND whenever the admin logs in/out → drafts appear/disappear without a page reload.
    effect(() => {
      this.auth.isLoggedIn();
      untracked(() => this.load());
    });

    // The pinned panel only exists once news has loaded — (re)attach the
    // size observer whenever it appears or is re-created.
    effect(() => {
      const sticky = this.stickyRef()?.nativeElement ?? null;
      untracked(() => {
        if (sticky === this.observedSticky) return;
        this.resizeObs?.disconnect();
        this.observedSticky = sticky;
        if (sticky && typeof window !== 'undefined' && 'ResizeObserver' in window) {
          this.resizeObs = new ResizeObserver(() => { this.measure(); this.scheduleUpdate(); });
          this.resizeObs.observe(sticky);
        }
        requestAnimationFrame(() => { this.measure(); this.scheduleUpdate(); });
      });
    });

    // Re-fit the timeline panels whenever the column appears / resizes, the
    // shown group or selected story changes, or the language switches.
    effect(() => {
      const col = this.timelineColRef()?.nativeElement ?? null;
      this.activeGroup();
      this.selectedInGroup();
      this.ts.currentLang();
      untracked(() => {
        if (col !== this.observedCol) {
          this.colObs?.disconnect();
          this.observedCol = col;
          if (col && typeof window !== 'undefined' && 'ResizeObserver' in window) {
            this.colObs = new ResizeObserver(() => this.scheduleFit());
            this.colObs.observe(col);
          }
        }
        this.scheduleFit();
      });
    });

    // If the list changes (story added/deleted) keep the selection in range.
    effect(() => {
      const len = this.sortedItems().length;
      untracked(() => {
        if (len && this.currentFlatIndex() > len - 1) this.jumpToFlatIndex(len - 1);
        this.scheduleUpdate();
      });
    });

    afterNextRender(() => {
      this.measure();
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize, { passive: true });
      this.detachWheel = attachModalAwareWheel(this.onWheel);
    });

    this.destroyRef.onDestroy(() => {
      if (typeof window === 'undefined') return;
      if (this.rafHandle !== null) cancelAnimationFrame(this.rafHandle);
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
      this.detachWheel?.();
      this.resizeObs?.disconnect();
      this.colObs?.disconnect();
    });
  }

  t = (k: string) => this.ts.t(k);

  /** Arabic/English text with graceful fallback when one language is empty. */
  loc(ar: string, en: string): string {
    return (this.ts.currentLang() === 'ar' ? ar || en : en || ar) || '';
  }

  /** Card grid uses the small generated thumbnail instead of the full-size image. */
  /** Card grid always uses the small generated thumbnail — now that 1 and 2-card
   *  layouts are both width-capped by CSS (instead of stretching edge-to-edge), the
   *  thumbnail's resolution is enough in every case, so no exception is needed here. */
  thumb = thumbUrl;

  fmtDate(iso: string): string {
    if (!iso) return '';
    const value = /(Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : iso + 'Z'; // API dates are UTC
    return new Intl.DateTimeFormat(this.ts.currentLang() === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    }).format(new Date(value));
  }

  load(): void {
    const seq = ++this.requestSeq;
    if (!this.items().length) this.loading.set(true);
    this.failed.set(false);

    this.api.list().subscribe({
      next: list => {
        if (seq !== this.requestSeq) return;
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => {
        if (seq !== this.requestSeq) return;
        this.loading.set(false);
        this.failed.set(true);
      }
    });
  }


  /* ───────── admin: add / edit ───────── */

  startCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  startEdit(item: NewsItem, event?: Event): void {
    event?.stopPropagation();
    if (this.loadingEditId() !== null) return;
    this.loadingEditId.set(item.id);
    this.api.get(item.id).subscribe({
      next: full => {
        this.loadingEditId.set(null);
        this.editing.set(full);
        this.formOpen.set(true);
      },
      error: err => {
        this.loadingEditId.set(null);
        this.toast.error(extractApiError(err, this.t) || this.t('admin.errLoadItem'));
      }
    });
  }

  onSaved(): void {
    this.formOpen.set(false);
    this.editing.set(null);
    this.load();
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  /* ───────── admin: delete ───────── */

  askDelete(item: NewsItem, event?: Event): void {
    event?.stopPropagation();
    this.deleting.set(item);
  }

  confirmDelete(): void {
    const item = this.deleting();
    if (!item || this.deleteBusy()) return;
    this.deleteBusy.set(true);
    this.api.delete(item.id).subscribe({
      next: () => {
        this.deleteBusy.set(false);
        this.deleting.set(null);
        this.items.update(list => list.filter(n => n.id !== item.id));
        this.toast.success(this.t('admin.newsDeleted'));
      },
      error: err => {
        this.deleteBusy.set(false);
        this.toast.error(extractApiError(err, this.t));
      }
    });
  }

  /* ───────── read-only details ───────── */

  openDetail(item: NewsItem): void {
    this.viewing.set(item);
    this.viewDetail.set(null);
    document.body.classList.add('kp-modal-open');

    this.api.get(item.slug).subscribe({
      next: full => { if (this.viewing()?.id === item.id) this.viewDetail.set(full); },
      error: err => {
        this.toast.error(extractApiError(err, this.t));
        this.closeDetail();
      }
    });
  }

  /** Enter on the card opens it — but not when Enter was pressed on the edit/delete buttons inside it. */
  onCardKey(event: Event, item: NewsItem): void {
    if (event.target === event.currentTarget) this.openDetail(item);
  }

  closeDetail(): void {
    this.viewing.set(null);
    this.viewDetail.set(null);
    document.body.classList.remove('kp-modal-open');
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.viewing() && !this.formOpen() && !this.deleting()) this.closeDetail();
    else if (this.allNewsOpen() && !this.formOpen() && !this.deleting()) this.closeAllNews();
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  /** Thumbnail 404s (e.g. an image uploaded before thumbnails existed) → retry once with
   *  the original full-size URL before giving up and hiding the image like onImgError. */
  onThumbError(event: Event, fallbackUrl: string): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== fallbackUrl) {
      img.src = fallbackUrl;
    } else {
      this.onImgError(event);
    }
  }
}
