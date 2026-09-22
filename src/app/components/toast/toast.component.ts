import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="t.type" role="status" (click)="toast.dismiss(t.id)">
          <span class="icon" aria-hidden="true">
            @switch (t.type) {
              @case ('success') { ✓ }
              @case ('error') { ! }
              @default { i }
            }
          </span>
          <span class="msg">{{ t.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: 88px;
      inset-inline-end: 20px;
      z-index: 3000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: min(380px, calc(100vw - 40px));
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #fff;
      border: 1px solid var(--card-border);
      border-inline-start-width: 4px;
      border-radius: 12px;
      box-shadow: 0 12px 32px -6px rgba(11, 21, 40, 0.22);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--dark-navy);
      cursor: pointer;
      animation: toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast.success { border-inline-start-color: #16A34A; }
    .toast.error { border-inline-start-color: var(--danger-red); }
    .toast.info { border-inline-start-color: var(--primary-blue); }
    .icon {
      flex: 0 0 22px; height: 22px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 800; color: #fff;
    }
    .success .icon { background: #16A34A; }
    .error .icon { background: var(--danger-red); }
    .info .icon { background: var(--primary-blue); }
    @keyframes toast-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
  `]
})
export class ToastComponent {
  toast = inject(ToastService);
}
