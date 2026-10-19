import { Component, HostListener, OnDestroy, OnInit, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CreateTeamUser, TeamRole, TeamUser, UsersService } from '../../services/users.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { extractApiError } from '../../core/api-error';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

/**
 * Admin-only pop-up: list the team's accounts, add a new one (Editor by
 * default — can add/edit news & projects only), turn accounts on/off,
 * reset a password, or delete an account.
 */
@Component({
  selector: 'app-team-accounts',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './team-accounts.component.html',
  styleUrl: './team-accounts.component.css',
})
export class TeamAccountsComponent implements OnInit, OnDestroy {
  private users = inject(UsersService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);
  ts = inject(TranslationService);

  closed = output<void>();

  list = signal<TeamUser[]>([]);
  loading = signal(true);
  loadError = signal('');
  busyId = signal<number | null>(null);

  // add form
  formOpen = signal(false);
  saving = signal(false);
  formError = signal('');
  submitted = signal(false);
  showPassword = signal(false);
  form: CreateTeamUser = this.emptyForm();

  // reset-password row
  resetId = signal<number | null>(null);
  resetValue = '';

  // delete confirm
  toDelete = signal<TeamUser | null>(null);

  myId = computed(() => Number(this.auth.user()?.id ?? -1));

  t(key: string): string { return this.ts.t(key); }

  ngOnInit(): void {
    document.body.classList.add('kp-modal-open');
    this.load();
  }

  ngOnDestroy(): void {
    // only drop the lock if no other pop-up is still open
    if (!document.querySelector('.kp-modal-backdrop:not(.team-backdrop)')) {
      document.body.classList.remove('kp-modal-open');
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.toDelete() || this.saving()) return;
    this.closed.emit();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.users.list().subscribe({
      next: list => {
        this.list.set(list.sort((a, b) => (a.role === b.role ? a.fullName.localeCompare(b.fullName) : a.role === 'admin' ? -1 : 1)));
        this.loading.set(false);
      },
      error: err => {
        this.loadError.set(extractApiError(err, k => this.t(k)));
        this.loading.set(false);
      },
    });
  }

  /* ───── add ───── */

  openForm(): void {
    this.form = this.emptyForm();
    this.formError.set('');
    this.submitted.set(false);
    this.showPassword.set(true);
    this.formOpen.set(true);
  }

  cancelForm(): void { this.formOpen.set(false); }

  generatePassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const bytes = new Uint32Array(12);
    crypto.getRandomValues(bytes);
    let out = '';
    bytes.forEach(b => (out += chars[b % chars.length]));
    this.form.password = out.slice(0, 4) + '-' + out.slice(4, 8) + '-' + out.slice(8);
    this.showPassword.set(true);
  }

  get emailValid(): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim()); }
  get formValid(): boolean {
    return this.form.fullName.trim().length > 1 && this.emailValid && this.form.password.length >= 6;
  }

  save(): void {
    this.submitted.set(true);
    if (!this.formValid || this.saving()) return;
    this.saving.set(true);
    this.formError.set('');

    const dto: CreateTeamUser = {
      ...this.form,
      fullName: this.form.fullName.trim(),
      email: this.form.email.trim().toLowerCase(),
    };
    this.users.create(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(this.t('admin.team.created').replace('{email}', dto.email));
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(extractApiError(err, k => this.t(k)));
      },
    });
  }

  copyLogin(): void {
    const text = `${this.form.email.trim()}\n${this.form.password}`;
    navigator.clipboard?.writeText(text).then(
      () => this.toast.success(this.t('admin.team.copied')),
      () => {}
    );
  }

  /* ───── row actions ───── */

  setRole(u: TeamUser, role: TeamRole): void {
    if (u.role === role) return;
    this.patch(u, { role }, () => this.toast.success(this.t('admin.team.roleChanged')));
  }

  toggleActive(u: TeamUser): void {
    this.patch(u, { isActive: !u.isActive }, () =>
      this.toast.success(this.t(u.isActive ? 'admin.team.disabled' : 'admin.team.enabled'))
    );
  }

  startReset(u: TeamUser): void {
    this.resetId.set(u.id);
    this.resetValue = '';
  }

  saveReset(u: TeamUser): void {
    if (this.resetValue.length < 6) return;
    this.patch(u, { password: this.resetValue }, () => {
      this.resetId.set(null);
      this.toast.success(this.t('admin.team.passwordReset'));
    });
  }

  private patch(u: TeamUser, dto: Partial<CreateTeamUser>, done: () => void): void {
    this.busyId.set(u.id);
    this.users.update(u.id, dto).subscribe({
      next: () => { this.busyId.set(null); done(); this.load(); },
      error: err => { this.busyId.set(null); this.toast.error(extractApiError(err, k => this.t(k))); },
    });
  }

  askDelete(u: TeamUser): void { this.toDelete.set(u); }

  /** The confirm dialog unlocks page scrolling when it closes; this pop-up is
   *  still open, so lock it again. */
  closeConfirm(): void {
    this.toDelete.set(null);
    setTimeout(() => document.body.classList.add('kp-modal-open'));
  }

  confirmDelete(): void {
    const u = this.toDelete();
    if (!u) return;
    this.busyId.set(u.id);
    this.users.remove(u.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.closeConfirm();
        this.toast.success(this.t('admin.team.deleted'));
        this.load();
      },
      error: err => {
        this.busyId.set(null);
        this.closeConfirm();
        this.toast.error(extractApiError(err, k => this.t(k)));
      },
    });
  }

  initials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  }

  lastLogin(u: TeamUser): string {
    if (!u.lastLoginAt) return this.t('admin.team.neverLoggedIn');
    const d = new Date(u.lastLoginAt);
    return this.t('admin.team.lastLogin') + ' ' + new Intl.DateTimeFormat(this.ts.currentLang() === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium' }).format(d);
  }

  private emptyForm(): CreateTeamUser {
    return { fullName: '', email: '', password: '', role: 'editor', isActive: true };
  }
}
