import { Component, HostListener, OnDestroy, OnInit, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="kp-modal-backdrop" (click)="cancelled.emit()">
      <div class="kp-modal kp-modal-sm" role="alertdialog" aria-modal="true" [attr.aria-label]="title()" (click)="$event.stopPropagation()">
        <div class="body">
          <div class="warn" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
            </svg>
          </div>
          <h3>{{ title() }}</h3>
          <p>{{ message() }}</p>
          @if (itemName()) { <div class="item">{{ itemName() }}</div> }
        </div>
        <div class="kp-modal-footer">
          <button type="button" class="kp-btn kp-btn-ghost" [disabled]="busy()" (click)="cancelled.emit()">{{ cancelLabel() }}</button>
          <button type="button" class="kp-btn kp-btn-danger" [disabled]="busy()" (click)="confirmed.emit()">
            @if (busy()) { <span class="kp-spinner"></span> }
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .body { padding: 1.75rem 1.5rem 1.25rem; text-align: center; }
    .warn { width: 54px; height: 54px; margin: 0 auto 1rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--danger-bg); color: var(--danger-red); border: 1px solid var(--danger-border); }
    h3 { font-size: 1.125rem; font-weight: 800; color: var(--dark-navy); margin-bottom: 0.5rem; }
    p { font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.6; }
    .item { margin-top: 0.875rem; padding: 0.5rem 0.75rem; background: var(--bg-page); border-radius: 8px; font-weight: 700; color: var(--dark-navy); font-size: 0.875rem; word-break: break-word; }
  `]
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  title = input.required<string>();
  message = input.required<string>();
  itemName = input<string>('');
  confirmLabel = input.required<string>();
  cancelLabel = input.required<string>();
  busy = input(false);

  confirmed = output<void>();
  cancelled = output<void>();

  ngOnInit(): void { document.body.classList.add('kp-modal-open'); }
  ngOnDestroy(): void { document.body.classList.remove('kp-modal-open'); }

  @HostListener('document:keydown.escape')
  onEsc(): void { if (!this.busy()) this.cancelled.emit(); }
}
