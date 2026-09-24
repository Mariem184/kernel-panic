import { Component, DestroyRef, HostListener, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { MediaService, validateImageFile } from '../../services/media.service';
import { ProjectCreatePayload, ProjectDetail } from '../../models/content.models';
import { extractApiError } from '../../core/api-error';
import { SLUG_PATTERN, atLeastOneOf, httpUrlValidator, linesToList, slugify, truncateForBackend } from '../../core/form-utils';
import { translatePairs } from '../../core/auto-translate';
import { TagInputComponent } from '../tag-input/tag-input.component';

type Tab = 'basic' | 'details' | 'tech' | 'extras';
type ProjectField = keyof ProjectFormComponent['form']['controls'];

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule, TagInputComponent],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css'
})
export class ProjectFormComponent implements OnInit, OnDestroy {
  /** null → create mode, otherwise edit this project. */
  project = input<ProjectDetail | null>(null);
  saved = output<ProjectDetail>();
  closed = output<void>();

  private fb = inject(FormBuilder);
  private api = inject(ProjectsService);
  private media = inject(MediaService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  ts = inject(TranslationService);

  tab = signal<Tab>('basic');
  saving = signal(false);
  translating = signal(false);
  uploadingImage = signal(false);
  uploadingGallery = signal(false);
  formError = signal('');

  // Tag-style lists (bound with [(values)])
  categories = signal<string[]>([]);
  technologies = signal<string[]>([]);
  frontendTech = signal<string[]>([]);
  backendTech = signal<string[]>([]);

  // Team members — embedded per-project (NOT a shared/global directory): each project
  // keeps its own list, so adding or removing someone here never touches any other
  // project. A per-row avatar upload tracks which row (if any) is currently uploading.
  teamMembers = new FormArray<FormGroup>([]);
  uploadingMemberAvatar = signal<number | null>(null);

  private slugTouchedByUser = false;

  form = this.fb.nonNullable.group({
    nameAr: ['', Validators.maxLength(600)],
    nameEn: ['', Validators.maxLength(600)],
    slug: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(SLUG_PATTERN)]],
    shortDescriptionAr: ['', Validators.maxLength(2000)],
    shortDescriptionEn: ['', Validators.maxLength(2000)],
    mainImageUrl: ['', [Validators.maxLength(1000), httpUrlValidator]],
    additionalImagesText: [''],
    status: ['published' as 'published' | 'draft'],

    detailedDescriptionAr: [''],
    detailedDescriptionEn: [''],
    typeAr: [''],
    typeEn: [''],
    roleAr: [''],
    roleEn: [''],
    clientAr: [''],
    clientEn: [''],
    durationAr: [''],
    durationEn: [''],
    videoUrl: ['', [Validators.maxLength(1000), httpUrlValidator]],

    painPointsArText: [''],
    painPointsEnText: ['']
  }, { validators: atLeastOneOf('nameAr', 'nameEn') });

  keyFeatures = new FormArray<FormGroup>([]);
  executionSteps = new FormArray<FormGroup>([]);
  results = new FormArray<FormGroup>([]);

  private readonly tabFields: Record<Tab, ProjectField[]> = {
    basic: ['nameAr', 'nameEn', 'slug', 'shortDescriptionAr', 'shortDescriptionEn', 'mainImageUrl'],
    details: ['videoUrl'],
    tech: [],
    extras: []
  };
  readonly tabs: Tab[] = ['basic', 'details', 'tech', 'extras'];

  get isEdit(): boolean { return !!this.project(); }
  t = (k: string) => this.ts.t(k);

  /** True once the admin has interacted with either name field and left BOTH empty. */
  get nameMissing(): boolean {
    return !!this.form.errors?.['bothEmpty'] && (this.form.controls.nameAr.touched || this.form.controls.nameEn.touched);
  }

  tabLabel(tab: Tab): string {
    return this.t({ basic: 'admin.f.tabBasic', details: 'admin.f.tabDetails', tech: 'admin.f.tabTech', extras: 'admin.f.tabExtras' }[tab]);
  }

  tabHasError(tab: Tab): boolean {
    return this.tabFields[tab].some(f => {
      const c = this.form.controls[f];
      return c.invalid && (c.touched || c.dirty);
    });
  }

  ngOnInit(): void {
    document.body.classList.add('kp-modal-open');

    const p = this.project();
    if (p) {
      this.slugTouchedByUser = true;
      this.form.patchValue({
        nameAr: p.nameAr, nameEn: p.nameEn, slug: p.slug,
        shortDescriptionAr: p.shortDescriptionAr ?? '', shortDescriptionEn: p.shortDescriptionEn ?? '',
        mainImageUrl: p.mainImageUrl ?? '',
        additionalImagesText: (p.additionalImageUrls ?? []).join('\n'),
        status: p.status,
        detailedDescriptionAr: p.detailedDescriptionAr ?? '', detailedDescriptionEn: p.detailedDescriptionEn ?? '',
        typeAr: p.typeAr ?? '', typeEn: p.typeEn ?? '',
        roleAr: p.roleAr ?? '', roleEn: p.roleEn ?? '',
        clientAr: p.clientAr ?? '', clientEn: p.clientEn ?? '',
        durationAr: p.durationAr ?? '', durationEn: p.durationEn ?? '',
        videoUrl: p.videoUrl ?? '',
        painPointsArText: (p.painPointsAr ?? []).join('\n'),
        painPointsEnText: (p.painPointsEn ?? []).join('\n')
      });
      this.categories.set([...(p.categories ?? [])]);
      this.technologies.set([...(p.technologies ?? [])]);
      this.frontendTech.set([...(p.frontendTech ?? [])]);
      this.backendTech.set([...(p.backendTech ?? [])]);
      (p.keyFeatures ?? []).forEach(f => this.keyFeatures.push(this.featureGroup(f)));
      [...(p.executionSteps ?? [])].sort((a, b) => a.order - b.order).forEach(s => this.executionSteps.push(this.stepGroup(s)));
      (p.results ?? []).forEach(r => this.results.push(this.resultGroup(r)));
      (p.teamMembers ?? []).forEach(m => this.teamMembers.push(this.teamMemberGroup(m)));
    }

    this.form.controls.nameEn.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        if (!this.slugTouchedByUser) this.form.controls.slug.setValue(slugify(v), { emitEvent: false });
      });
    this.form.controls.nameAr.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        if (!this.slugTouchedByUser && !this.form.controls.nameEn.value) {
          this.form.controls.slug.setValue(slugify(v), { emitEvent: false });
        }
      });
  }

  ngOnDestroy(): void { document.body.classList.remove('kp-modal-open'); }

  @HostListener('document:keydown.escape')
  onEsc(): void { if (!this.saving()) this.closed.emit(); }

  onSlugInput(): void { this.slugTouchedByUser = true; }

  /* ───────── repeaters ───────── */

  private featureGroup(f?: Partial<{ icon: string; titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string }>): FormGroup {
    return this.fb.nonNullable.group({
      icon: [f?.icon ?? ''], titleAr: [f?.titleAr ?? ''], titleEn: [f?.titleEn ?? ''],
      descriptionAr: [f?.descriptionAr ?? ''], descriptionEn: [f?.descriptionEn ?? '']
    });
  }
  private stepGroup(s?: Partial<{ titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string }>): FormGroup {
    return this.fb.nonNullable.group({
      titleAr: [s?.titleAr ?? ''], titleEn: [s?.titleEn ?? ''],
      descriptionAr: [s?.descriptionAr ?? ''], descriptionEn: [s?.descriptionEn ?? '']
    });
  }
  private resultGroup(r?: Partial<{ titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string }>): FormGroup {
    return this.stepGroup(r);
  }
  private teamMemberGroup(m?: Partial<{ nameAr: string; nameEn: string; jobTitleAr: string; jobTitleEn: string; avatarUrl: string }>): FormGroup {
    return this.fb.nonNullable.group({
      nameAr: [m?.nameAr ?? ''], nameEn: [m?.nameEn ?? ''],
      jobTitleAr: [m?.jobTitleAr ?? ''], jobTitleEn: [m?.jobTitleEn ?? ''],
      avatarUrl: [m?.avatarUrl ?? '']
    });
  }

  addFeature(): void { this.keyFeatures.push(this.featureGroup()); }
  addStep(): void { this.executionSteps.push(this.stepGroup()); }
  addResult(): void { this.results.push(this.resultGroup()); }
  addTeamMember(): void { this.teamMembers.push(this.teamMemberGroup()); }
  removeAt(arr: FormArray<FormGroup>, i: number): void { arr.removeAt(i); }

  /** "Add a photo" for one team-member row — uploads the file and fills that row's avatarUrl. */
  onTeamMemberAvatarSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const problem = validateImageFile(file);
    if (problem) {
      this.toast.error(this.t(problem === 'tooLarge' ? 'admin.f.imageTooLarge' : 'admin.f.imageInvalidType'));
      return;
    }

    this.uploadingMemberAvatar.set(index);
    this.media.upload(file).subscribe({
      next: res => {
        this.uploadingMemberAvatar.set(null);
        (this.teamMembers.at(index) as FormGroup).controls['avatarUrl'].setValue(res.url);
      },
      error: err => {
        this.uploadingMemberAvatar.set(null);
        this.toast.error(extractApiError(err, this.t));
      }
    });
  }

  loc(ar: string, en: string): string {
    return (this.ts.currentLang() === 'ar' ? ar || en : en || ar) || '';
  }

  /* ───────── validation helpers ───────── */

  invalid(name: ProjectField): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  errorText(name: ProjectField): string {
    const e = this.form.controls[name].errors;
    if (!e) return '';
    if (e['required']) return this.t('admin.f.required');
    if (e['pattern']) return this.t('admin.f.invalidSlug');
    if (e['url']) return this.t('admin.f.invalidUrl');
    if (e['maxlength']) return this.t('admin.f.tooLong');
    return this.t('admin.f.required');
  }

  /** "Upload from my computer" for the main image — same idea as the news form. */
  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
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

  /** "Add photos from my computer" for the gallery — uploads each picked file and
   *  appends its URL as a new line to the same textarea "one link per line" expects. */
  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;

    const valid: File[] = [];
    for (const file of files) {
      const problem = validateImageFile(file);
      if (problem) {
        this.toast.error(`${file.name}: ${this.t(problem === 'tooLarge' ? 'admin.f.imageTooLarge' : 'admin.f.imageInvalidType')}`);
      } else {
        valid.push(file);
      }
    }
    if (!valid.length) return;

    this.uploadingGallery.set(true);
    let remaining = valid.length;
    let anyFailed = false;
    for (const file of valid) {
      this.media.upload(file).subscribe({
        next: res => {
          const ctrl = this.form.controls.additionalImagesText;
          const current = ctrl.value.trim();
          ctrl.setValue(current ? `${current}\n${res.url}` : res.url);
          ctrl.markAsTouched();
        },
        error: () => { anyFailed = true; },
        complete: () => {
          if (--remaining === 0) {
            this.uploadingGallery.set(false);
            if (anyFailed) this.toast.error(this.t('admin.f.someUploadsFailed'));
          }
        }
      });
    }
  }

  /* ───────── submit ───────── */

  async submit(): Promise<void> {
    if (this.saving()) return;
    this.formError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const firstBad = this.tabs.find(t => this.tabFields[t].some(f => this.form.controls[f].invalid));
      if (firstBad) this.tab.set(firstBad);
      this.formError.set(this.t('admin.errFix'));
      return;
    }

    this.saving.set(true);
    const v = this.form.getRawValue();
    const filled = (g: { titleAr?: string; titleEn?: string }) => !!(g.titleAr?.trim() || g.titleEn?.trim());
    const clean = <T extends Record<string, string>>(g: T): T =>
      Object.fromEntries(Object.entries(g).map(([k, val]) => [k, String(val ?? '').trim()])) as T;

    // Any field typed in only one language gets machine-translated into the other —
    // this is what actually makes the Arabic/English toggle show real content instead
    // of the same untranslated text (or a blank) on one side. (Key features, execution
    // steps, results and pain-point lists are left as typed — not auto-translated yet.)
    let t: Awaited<ReturnType<typeof translatePairs>>;
    this.translating.set(true);
    try {
      t = await translatePairs({
        name: [v.nameAr.trim(), v.nameEn.trim()],
        shortDescription: [v.shortDescriptionAr.trim(), v.shortDescriptionEn.trim()],
        detailedDescription: [v.detailedDescriptionAr.trim(), v.detailedDescriptionEn.trim()],
        type: [v.typeAr.trim(), v.typeEn.trim()],
        role: [v.roleAr.trim(), v.roleEn.trim()],
        client: [v.clientAr.trim(), v.clientEn.trim()],
        duration: [v.durationAr.trim(), v.durationEn.trim()]
      });
    } catch {
      // Translation service unreachable — fall back to whatever the admin typed, untouched.
      t = {
        name: { ar: v.nameAr.trim(), en: v.nameEn.trim() },
        shortDescription: { ar: v.shortDescriptionAr.trim(), en: v.shortDescriptionEn.trim() },
        detailedDescription: { ar: v.detailedDescriptionAr.trim(), en: v.detailedDescriptionEn.trim() },
        type: { ar: v.typeAr.trim(), en: v.typeEn.trim() },
        role: { ar: v.roleAr.trim(), en: v.roleEn.trim() },
        client: { ar: v.clientAr.trim(), en: v.clientEn.trim() },
        duration: { ar: v.durationAr.trim(), en: v.durationEn.trim() }
      };
    } finally {
      this.translating.set(false);
    }

    const payload: ProjectCreatePayload = {
      nameAr: truncateForBackend(t['name'].ar, 600),
      nameEn: truncateForBackend(t['name'].en, 600),
      slug: v.slug.trim().toLowerCase(),
      shortDescriptionAr: truncateForBackend(t['shortDescription'].ar, 2000),
      shortDescriptionEn: truncateForBackend(t['shortDescription'].en, 2000),
      detailedDescriptionAr: t['detailedDescription'].ar,
      detailedDescriptionEn: t['detailedDescription'].en,
      categories: this.categories(),
      mainImageUrl: v.mainImageUrl.trim(),
      additionalImageUrls: linesToList(v.additionalImagesText),
      technologies: this.technologies(),
      typeAr: t['type'].ar, typeEn: t['type'].en,
      roleAr: t['role'].ar, roleEn: t['role'].en,
      frontendTech: this.frontendTech(),
      backendTech: this.backendTech(),
      durationAr: t['duration'].ar, durationEn: t['duration'].en,
      clientAr: t['client'].ar, clientEn: t['client'].en,
      sourceCodeUrl: '', // field removed from the admin form — "Source code" is no longer shown
      videoUrl: v.videoUrl.trim(),
      painPointsAr: linesToList(v.painPointsArText),
      painPointsEn: linesToList(v.painPointsEnText),
      keyFeatures: this.keyFeatures.getRawValue().map(clean).filter(filled) as ProjectCreatePayload['keyFeatures'],
      executionSteps: this.executionSteps.getRawValue().map(clean).filter(filled)
        .map((s, i) => ({ ...s, order: i + 1 })) as ProjectCreatePayload['executionSteps'],
      results: this.results.getRawValue().map(clean).filter(filled) as ProjectCreatePayload['results'],
      teamMembers: this.teamMembers.getRawValue().map(clean)
        .filter(m => (m as { nameAr: string; nameEn: string }).nameAr || (m as { nameAr: string; nameEn: string }).nameEn) as ProjectCreatePayload['teamMembers'],
      status: v.status
    };

    const current = this.project();
    const request$ = current ? this.api.update(current.id, payload) : this.api.create(payload);

    request$.subscribe({
      next: saved => {
        this.saving.set(false);
        this.toast.success(this.t(current ? 'admin.projectUpdated' : 'admin.projectCreated'));
        this.saved.emit(saved);
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(extractApiError(err, this.t));
      }
    });
  }
}
