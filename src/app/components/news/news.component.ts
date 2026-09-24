import { Component, HostListener, computed, effect, inject, signal, untracked } from '@angular/core';
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

const PAGE_SIZE = 3;

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [ScrollRevealDirective, NewsFormComponent, ConfirmDialogComponent],
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
  visibleCount = signal(PAGE_SIZE);
  pageSize = PAGE_SIZE;
  visible = computed(() => this.items().slice(0, this.visibleCount()));
  skeletons = [1, 2, 3];

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

  showMore(): void { this.visibleCount.update(c => c + PAGE_SIZE); }
  showLess(): void { this.visibleCount.set(PAGE_SIZE); }

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
