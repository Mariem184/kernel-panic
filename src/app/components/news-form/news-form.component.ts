import { Component, DestroyRef, HostListener, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewsService } from '../../services/news.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { MediaService, validateImageFile } from '../../services/media.service';
import { NewsCreatePayload, NewsDetail } from '../../models/content.models';
import { extractApiError } from '../../core/api-error';
import { SLUG_PATTERN, atLeastOneOf, dateInputToIso, httpUrlValidator, slugify, toDateInput, todayInput, truncateForBackend } from '../../core/form-utils';
import { translatePairs } from '../../core/auto-translate';

type NewsField = keyof NewsFormComponent['form']['controls'];

@Component({
  selector: 'app-news-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './news-form.component.html',
  styleUrl: './news-form.component.css'
})
export class NewsFormComponent implements OnInit, OnDestroy {
  /** null → create mode, otherwise edit this article. */
  news = input<NewsDetail | null>(null);
  saved = output<NewsDetail>();
  closed = output<void>();

  private fb = inject(FormBuilder);
  private api = inject(NewsService);
  private toast = inject(ToastService);
  private media = inject(MediaService);
  private destroyRef = inject(DestroyRef);
  ts = inject(TranslationService);

  saving = signal(false);
  translating = signal(false);
  uploadingImage = signal(false);
  formError = signal('');
  private slugTouchedByUser = false;
  private originalDate = '';

  form = this.fb.nonNullable.group({
    titleAr: ['', Validators.maxLength(600)],
    titleEn: ['', Validators.maxLength(600)],
    slug: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(SLUG_PATTERN)]],
    excerptAr: ['', Validators.maxLength(1500)],
    excerptEn: ['', Validators.maxLength(1500)],
    contentArHtml: [''],
    contentEnHtml: [''],
    mainImageUrl: ['', [Validators.maxLength(1000), httpUrlValidator]],
    categoryAr: ['', Validators.maxLength(300)],
    categoryEn: ['', Validators.maxLength(300)],
    authorNameAr: ['', Validators.maxLength(400)],
    authorNameEn: ['', Validators.maxLength(400)],
    readingTimeMinutes: [5, [Validators.required, Validators.min(1), Validators.max(240)]],
    externalUrl: ['', [Validators.maxLength(1000), httpUrlValidator]],
    publishedDate: [todayInput()],
    status: ['published' as 'published' | 'draft'],
    isFeatured: [false]
  }, { validators: atLeastOneOf('titleAr', 'titleEn') });

  get isEdit(): boolean { return !!this.news(); }
  t = (k: string) => this.ts.t(k);

  ngOnInit(): void {
    document.body.classList.add('kp-modal-open');

    const n = this.news();
    if (n) {
      this.originalDate = toDateInput(n.publishedAt);
      this.slugTouchedByUser = true; // never auto-rewrite an existing slug
      this.form.patchValue({
        titleAr: n.titleAr,
        titleEn: n.titleEn,
        slug: n.slug,
        excerptAr: n.excerptAr ?? '',
        excerptEn: n.excerptEn ?? '',
        contentArHtml: n.contentArHtml ?? '',
        contentEnHtml: n.contentEnHtml ?? '',
        mainImageUrl: n.mainImageUrl ?? '',
        categoryAr: n.categoryAr ?? '',
        categoryEn: n.categoryEn ?? '',
        authorNameAr: n.authorNameAr ?? '',
        authorNameEn: n.authorNameEn ?? '',
        readingTimeMinutes: n.readingTimeMinutes || 5,
        externalUrl: n.externalUrl ?? '',
        publishedDate: this.originalDate,
        status: n.status,
        isFeatured: n.isFeatured
      });
    }

    // New article: build the slug from whichever title the admin types first (English preferred,
    // since the slug pattern only keeps a-z/0-9 — an Arabic-only title won't produce one and the
    // admin types their own, which the hint under the field already explains).
    this.form.controls.titleEn.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        if (!this.slugTouchedByUser) this.form.controls.slug.setValue(slugify(v), { emitEvent: false });
      });
    this.form.controls.titleAr.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        if (!this.slugTouchedByUser && !this.form.controls.titleEn.value) {
          this.form.controls.slug.setValue(slugify(v), { emitEvent: false });
        }
      });
  }

  /** True once the admin has interacted with either title field and left BOTH empty. */
  get titleMissing(): boolean {
    return !!this.form.errors?.['bothEmpty'] && (this.form.controls.titleAr.touched || this.form.controls.titleEn.touched);
  }

  ngOnDestroy(): void { document.body.classList.remove('kp-modal-open'); }

  @HostListener('document:keydown.escape')
  onEsc(): void { if (!this.saving()) this.closed.emit(); }

  onSlugInput(): void { this.slugTouchedByUser = true; }

  invalid(name: NewsField): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  errorText(name: NewsField): string {
    const e = this.form.controls[name].errors;
    if (!e) return '';
    if (e['required']) return this.t('admin.f.required');
    if (e['pattern']) return this.t('admin.f.invalidSlug');
    if (e['url']) return this.t('admin.f.invalidUrl');
    if (e['maxlength']) return this.t('admin.f.tooLong');
    return this.t('admin.f.required');
  }

  /** "Upload from my computer" for the main image — picks a file, uploads it to the
   *  API, then fills the same mainImageUrl control the "paste a link" input uses. */
  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // always reset, so picking the same file again still fires 'change'
    if (!file) return;

    const problem = validateImageFile(file);
    if (problem) {
      this.toast.error(this.t(problem === 'tooLarge' ? 'admin.f.imageTooLarge' : 'admin.f.imageInvalidType'));
      return;
    }

    this.uploadingImage.set(true);
    this.media.upload(file).subscribe({
      next: res => {
        this.uploadingImage.set(false);
        this.form.controls.mainImageUrl.setValue(res.url);
        this.form.controls.mainImageUrl.markAsTouched();
      },
      error: err => {
        this.uploadingImage.set(false);
        this.toast.error(extractApiError(err, this.t));
      }
    });
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    this.formError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set(this.t('admin.errFix'));
      return;
    }

    this.saving.set(true);
    const v = this.form.getRawValue();

    // Any field typed in only one language gets machine-translated into the other —
    // this is what actually makes the Arabic/English toggle show real content instead
    // of the same untranslated text (or a blank) on one side.
    let t: Awaited<ReturnType<typeof translatePairs>>;
    this.translating.set(true);
    try {
      t = await translatePairs({
        title: [v.titleAr.trim(), v.titleEn.trim()],
        excerpt: [v.excerptAr.trim(), v.excerptEn.trim()],
        content: [v.contentArHtml.trim(), v.contentEnHtml.trim()],
        category: [v.categoryAr.trim(), v.categoryEn.trim()],
        author: [v.authorNameAr.trim(), v.authorNameEn.trim()]
      });
    } catch {
      // Translation service unreachable — fall back to whatever the admin typed, untouched.
      t = {
        title: { ar: v.titleAr.trim(), en: v.titleEn.trim() },
        excerpt: { ar: v.excerptAr.trim(), en: v.excerptEn.trim() },
        content: { ar: v.contentArHtml.trim(), en: v.contentEnHtml.trim() },
        category: { ar: v.categoryAr.trim(), en: v.categoryEn.trim() },
        author: { ar: v.authorNameAr.trim(), en: v.authorNameEn.trim() }
      };
    } finally {
      this.translating.set(false);
    }

    const payload: NewsCreatePayload = {
      titleAr: truncateForBackend(t['title'].ar, 600),
      titleEn: truncateForBackend(t['title'].en, 600),
      slug: v.slug.trim().toLowerCase(),
      contentArHtml: t['content'].ar,
      contentEnHtml: t['content'].en,
      excerptAr: truncateForBackend(t['excerpt'].ar, 1500),
      excerptEn: truncateForBackend(t['excerpt'].en, 1500),
      mainImageUrl: v.mainImageUrl.trim(),
      categoryAr: truncateForBackend(t['category'].ar, 300),
      categoryEn: truncateForBackend(t['category'].en, 300),
      authorNameAr: truncateForBackend(t['author'].ar, 400),
      authorNameEn: truncateForBackend(t['author'].en, 400),
      readingTimeMinutes: Number(v.readingTimeMinutes) || 5,
      externalUrl: v.externalUrl.trim(), // "" clears it on the server
      status: v.status,
      isFeatured: v.isFeatured
    };

    // Only touch the publish date if the admin actually changed it (keeps the original time-of-day / ordering).
    if (v.publishedDate && v.publishedDate !== this.originalDate) {
      payload.publishedAt = dateInputToIso(v.publishedDate);
    }

    const current = this.news();
    const request$ = current ? this.api.update(current.id, payload) : this.api.create(payload);

    request$.subscribe({
      next: saved => {
        this.saving.set(false);
        this.toast.success(this.t(current ? 'admin.newsUpdated' : 'admin.newsCreated'));
        this.saved.emit(saved);
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(extractApiError(err, this.t));
      }
    });
  }
}
