import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { Component, DestroyRef, HostListener, computed, effect, inject, signal, untracked } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { AuthService } from '../../services/auth.service';
import { ProjectsService } from '../../services/projects.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { ProjectDetail, ProjectItem } from '../../models/content.models';
import { extractApiError } from '../../core/api-error';
import { thumbUrl } from '../../core/image-url';
import { resolveVideoEmbed } from '../../core/video-embed';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

const PAGE_SIZE = 6;
/** Time each picture stays on screen in the project pop-up slideshow. */
const SLIDE_MS = 2200;

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [SectionHeadingComponent, ScrollRevealDirective, ProjectFormComponent, ConfirmDialogComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {
  ts = inject(TranslationService);
  private sanitizer = inject(DomSanitizer);
  auth = inject(AuthService);
  private api = inject(ProjectsService);
  private toast = inject(ToastService);

  items = signal<ProjectItem[]>([]);
  loading = signal(true);
  failed = signal(false);
  visibleCount = signal(PAGE_SIZE);
  pageSize = PAGE_SIZE;

  // ───────── category filter ─────────
  selectedCategory = signal<string | null>(null);

  categories = computed(() => {
    const set = new Set(
      this.items()
        .map(p => this.loc(p.typeAr, p.typeEn))
        .filter((c): c is string => !!c)
    );
    return [...set];
  });

  filtered = computed(() => {
    const cat = this.selectedCategory();
    return cat ? this.items().filter(p => this.loc(p.typeAr, p.typeEn) === cat) : this.items();
  });

  visible = computed(() => this.filtered().slice(0, this.visibleCount()));
  skeletons = [1, 2, 3];

  // ───────── featured showcase ─────────
  /** Index into visible() of the project currently shown large in the showcase. */
  featuredIndex = signal(0);

  /** The project currently shown large. Clamped so it never points past the end of visible(). */
  featured = computed(() => {
    const list = this.visible();
    if (!list.length) return null;
    const idx = Math.min(this.featuredIndex(), list.length - 1);
    return list[idx];
  });

  /** Wraps featured() in a 0-or-1 array keyed by project id, so the template can re-mount
   *  (via @for track) the featured media/info block whenever the selection changes — that
   *  remount is what retriggers the shared scroll-reveal fade/rise transition on switch. */
  featuredArr = computed(() => {
    const f = this.featured();
    return f ? [f] : [];
  });

  selectFeatured(i: number): void {
    this.featuredIndex.set(i);
    this.restartAutoplay();
  }

  nextFeatured(manual = false): void {
    const len = this.visible().length;
    if (!len) return;
    this.featuredIndex.update(i => (i + 1) % len);
    if (manual) this.restartAutoplay();
  }

  prevFeatured(): void {
    const len = this.visible().length;
    if (!len) return;
    this.featuredIndex.update(i => (i - 1 + len) % len);
    this.restartAutoplay();
  }

  // ───────── featured showcase autoplay ─────────
  /** Advances the big showcase on its own every few seconds, like a slideshow. Pauses while
   *  the pointer/keyboard focus is on the showcase, the tab is hidden, there's nothing to
   *  cycle through, or the visitor has asked for reduced motion. */
  private destroyRef = inject(DestroyRef);
  private autoplayHandle: ReturnType<typeof setInterval> | null = null;
  private readonly autoplayIntervalMs = 2000;
  autoplayPaused = signal(false);

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  private stopAutoplay(): void {
    if (this.autoplayHandle !== null) {
      clearInterval(this.autoplayHandle);
      this.autoplayHandle = null;
    }
  }

  private restartAutoplay(): void {
    this.stopAutoplay();
    if (this.visible().length < 2 || this.prefersReducedMotion()) return;
    this.autoplayHandle = setInterval(() => {
      if (this.autoplayPaused()) return;
      if (typeof document !== 'undefined' && document.hidden) return;
      // A pop-up is open (e.g. this project's details): the showcase behind
      // it stays still — it would only distract and cost scrolling smoothness.
      if (this.viewing() || (typeof document !== 'undefined' && document.body.classList.contains('kp-modal-open'))) return;
      this.nextFeatured();
    }, this.autoplayIntervalMs);
  }

  pauseAutoplay(): void { this.autoplayPaused.set(true); }
  resumeAutoplay(): void { this.autoplayPaused.set(false); }

  /** Duration of one full lap of the infinite thumbnail marquee — scales with the item
   *  count so each thumbnail drifts past at roughly the same pace regardless of how many
   *  projects are loaded. */
  stripAnimDuration = computed(() => `${Math.max(this.visible().length * 1.8, 6)}s`);

  // form modal
  formOpen = signal(false);
  editing = signal<ProjectDetail | null>(null);
  loadingEditId = signal<number | null>(null);

  // delete confirmation
  deleting = signal<ProjectItem | null>(null);
  deleteBusy = signal(false);

  // read-only details modal
  viewing = signal<ProjectItem | null>(null);
  viewDetail = signal<ProjectDetail | null>(null);
  activeImage = signal('');
  /** All pictures of the open project (main first). */
  galleryList = computed(() => {
    const d = this.viewDetail();
    return d ? this.gallery(d) : [];
  });
  activeIndex = computed(() => Math.max(0, this.galleryList().indexOf(this.activeImage())));
  /** Slideshow is paused while the pointer is over the picture or the thumbnails. */
  slidePaused = signal(false);
  private slideTimer: ReturnType<typeof setInterval> | null = null;
  /** Thumbnail marquee: one "half" holds the pictures repeated enough times
   *  (at least ~14 thumbnails) to be wider than the strip on any screen;
   *  the track is two identical halves so it loops without a jump. */
  private marqueeHalf = computed(() => {
    const list = this.galleryList();
    if (!list.length) return [] as string[];
    const repeat = Math.max(1, Math.ceil(14 / list.length));
    return Array.from({ length: repeat }, () => list).flat();
  });
  marqueeList = computed(() => [...this.marqueeHalf(), ...this.marqueeHalf()]);
  /** ~1.6s per thumbnail passing by — a steady, readable speed. */
  marqueeSeconds = computed(() => this.marqueeHalf().length * 1.6);

  /** True when the image currently shown at the top of the modal is portrait / near-square. */
  activePortrait = signal(false);

  /** Cards whose image is portrait / near-square (e.g. a phone screenshot), keyed by project id.
   *  The value is the URL that actually loaded, so the blurred backdrop reuses the same
   *  (already cached) file even if the thumbnail 404'd and we fell back to the full image. */
  private portraitSrc = signal<Record<number, string>>({});

  /** Anything narrower than this width/height ratio can't fill the wide card without
   *  chopping a big part off, so it is shown whole (contain) over a color-matched backdrop. */
  private static readonly PORTRAIT_MAX_RATIO = 1.2;

  private requestSeq = 0;

  constructor() {
    // Endless slideshow in the project pop-up: (re)starts whenever a project
    // opens or its pictures finish loading, stops when the pop-up closes.
    effect(() => {
      this.viewing();
      this.galleryList().length;
      untracked(() => this.restartSlideshow());
    });

    this.destroyRef.onDestroy(() => this.stopSlideshow());

    // Runs on init AND whenever the admin logs in/out → drafts appear/disappear without a reload.
    effect(() => {
      this.auth.isLoggedIn();
      untracked(() => this.load());
    });

    effect(() => {
    this.ts.currentLang();
    untracked(() => this.setCategory(null));
  });

    // Restart the showcase's autoplay timer whenever the cyclable list changes shape
    // (data loads, a filter is applied, an item is deleted, …).
    effect(() => {
      this.visible().length;
      untracked(() => this.restartAutoplay());
    });

    this.destroyRef.onDestroy(() => this.stopAutoplay());
  }

  t = (k: string) => this.ts.t(k);

  loc(ar: string, en: string): string {
    return (this.ts.currentLang() === 'ar' ? ar || en : en || ar) || '';
  }

  /** Gallery strip thumbnails (small, fixed size, unrelated to the card grid). Card grid
   *  now always uses this same thumbnail too — 1 and 2-card layouts are width-capped by
   *  CSS instead of stretching edge-to-edge, so the thumbnail's resolution is enough. */
  thumb = thumbUrl;

  /** Resolves the project's optional video link (YouTube/Vimeo/Google Drive/direct file)
   *  into something the template can render — an iframe with a sanitized URL, or a plain
   *  <video> tag. Returns null if there's no video or the link isn't a recognized source. */
  videoEmbed(videoUrl: string | null): { kind: 'iframe'; safeUrl: SafeResourceUrl } | { kind: 'file'; url: string } | null {
    const resolved = resolveVideoEmbed(videoUrl);
    if (!resolved) return null;
    if (resolved.kind === 'iframe') {
      return { kind: 'iframe', safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(resolved.url) };
    }
    return resolved;
  }

  /** Language-aware list with fallback to the other language. */
  locList(ar: string[] | undefined, en: string[] | undefined): string[] {
    const a = ar ?? [], e = en ?? [];
    return (this.ts.currentLang() === 'ar' ? (a.length ? a : e) : (e.length ? e : a));
  }

  /** Tech chips for a card: technologies first, then front/back tech, de-duplicated. */
  cardTech(p: ProjectItem): string[] {
    return [...new Set(p.technologies ?? [])];
  }

  detailTech(d: ProjectDetail): string[] {
    return [...new Set(d.technologies ?? [])];
  }

  gallery(d: ProjectDetail): string[] {
    return [d.mainImageUrl, ...(d.additionalImageUrls ?? [])].filter(Boolean);
  }

  initial(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
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

  showMore(): void { this.visibleCount.update(c => c + PAGE_SIZE); }
  showLess(): void { this.visibleCount.set(PAGE_SIZE); }

  /* ───────── category filter ───────── */

  setCategory(cat: string | null): void {
    this.selectedCategory.set(cat);
    this.visibleCount.set(this.pageSize);
    this.featuredIndex.set(0);
  }

  /* ───────── admin: add / edit ───────── */

  startCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  startEdit(item: ProjectItem, event?: Event): void {
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

  askDelete(item: ProjectItem, event?: Event): void {
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
        this.items.update(list => list.filter(p => p.id !== item.id));
        this.featuredIndex.set(0);
        this.toast.success(this.t('admin.projectDeleted'));
      },
      error: err => {
        this.deleteBusy.set(false);
        this.toast.error(extractApiError(err, this.t));
      }
    });
  }

  /* ───────── read-only details ───────── */

  openDetail(item: ProjectItem): void {
    this.viewing.set(item);
    this.viewDetail.set(null);
    this.activeImage.set(item.mainImageUrl || '');
    this.activePortrait.set(false);
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
  onCardKey(event: Event, item: ProjectItem): void {
    if (event.target === event.currentTarget) this.openDetail(item);
  }

  /* ───────── pop-up slideshow ───────── */

  /** Next (+1) / previous (-1) picture, wrapping around at both ends. */
  stepImage(step: number, fromTimer = false): void {
    const list = this.galleryList();
    if (list.length < 2) return;
    const i = this.activeIndex();
    this.activeImage.set(list[(i + step + list.length) % list.length]);
    if (!fromTimer) this.restartSlideshow(); // a manual pick gets a full slide time on screen
  }

  pickImage(img: string): void {
    this.activeImage.set(img);
    this.restartSlideshow();
  }

  private restartSlideshow(): void {
    this.stopSlideshow();
    if (!this.viewing() || this.galleryList().length < 2) return;
    this.slideTimer = setInterval(() => {
      if (this.slidePaused() || document.hidden) return;
      this.stepImage(1, true);
    }, SLIDE_MS);
  }

  private stopSlideshow(): void {
    if (this.slideTimer !== null) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  closeDetail(): void {
    this.stopSlideshow();
    this.slidePaused.set(false);
    this.viewing.set(null);
    this.viewDetail.set(null);
    document.body.classList.remove('kp-modal-open');
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.viewing() && !this.formOpen() && !this.deleting()) this.closeDetail();
  }

  /** URL to use for the blurred backdrop of this card, or '' when its image is landscape. */
  backdropSrc(id: number): string {
    return this.portraitSrc()[id] ?? '';
  }

  /** Projects forced into "contain" mode by name, even though their image isn't detected as portrait. */
private forcedContainNames = new Set<string>(['Ticketing & Task Management System']);

isContain(p: ProjectItem): boolean {
  return !!this.backdropSrc(p.id) || this.forcedContainNames.has(p.nameEn);
}

/** Backdrop image source for a card: the auto-detected portrait backdrop if there is one,
 *  otherwise the same image for any project forced into contain mode by name. */
backdropFor(p: ProjectItem): string {
  const auto = this.backdropSrc(p.id);
  if (auto) return auto;
  return this.forcedContainNames.has(p.nameEn) ? this.thumb(p.mainImageUrl) : '';
}

  /** Runs when a card image finishes loading (including after the thumbnail→full fallback):
   *  decides whether it needs the "show whole image on a matching background" treatment. */
  onCardImgLoad(event: Event, id: number): void {
    const img = event.target as HTMLImageElement;
    if (!img.naturalWidth || !img.naturalHeight) return;
    const isPortrait = img.naturalWidth / img.naturalHeight < ProjectsComponent.PORTRAIT_MAX_RATIO;
    const src = img.currentSrc || img.src;
    this.portraitSrc.update(map => {
      if (isPortrait) return map[id] === src ? map : { ...map, [id]: src };
      if (!(id in map)) return map;
      const { [id]: _removed, ...rest } = map;
      return rest;
    });
  }

  /** Modal top image finished loading (fires again each time a gallery thumbnail is picked). */
  onDetailImgLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.naturalWidth || !img.naturalHeight) return;
    this.activePortrait.set(img.naturalWidth / img.naturalHeight < ProjectsComponent.PORTRAIT_MAX_RATIO);
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