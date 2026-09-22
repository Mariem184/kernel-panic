import { Component, input, model, signal } from '@angular/core';

/**
 * Small "type + Enter" chips editor. Two-way bind with [(values)]="signalOrProperty".
 */
@Component({
  selector: 'app-tag-input',
  standalone: true,
  template: `
    <div class="box" (click)="field.focus()">
      @for (v of values(); track $index) {
        <span class="kp-chip">
          {{ v }}
          <button type="button" class="x" [attr.aria-label]="'Remove ' + v" (click)="remove($index); $event.stopPropagation()">×</button>
        </span>
      }
      <input
        #field
        class="field"
        type="text"
        [placeholder]="values().length ? '' : placeholder()"
        [value]="draft()"
        (input)="draft.set(field.value)"
        (keydown)="onKey($event)"
        (blur)="commit()"
      />
    </div>
  `,
  styles: [`
    .box {
      display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
      min-height: 44px; padding: 0.375rem 0.625rem;
      background: #fff; border: 1px solid var(--card-border); border-radius: 10px; cursor: text;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }
    .box:focus-within { border-color: var(--primary-blue); box-shadow: 0 0 0 3px var(--primary-blue-glow); }
    .field { flex: 1 1 120px; min-width: 100px; border: none; outline: none; font: inherit; font-size: 0.9375rem; padding: 0.25rem 0; background: transparent; }
    .x { border: none; background: none; cursor: pointer; font-size: 1rem; line-height: 1; color: inherit; padding: 0; opacity: 0.6; }
    .x:hover { opacity: 1; }
  `]
})
export class TagInputComponent {
  values = model<string[]>([]);
  placeholder = input('');
  draft = signal('');

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      this.commit();
    } else if (e.key === 'Backspace' && !this.draft() && this.values().length) {
      this.remove(this.values().length - 1);
    }
  }

  commit(): void {
    const v = this.draft().trim().replace(/,$/, '');
    if (v && !this.values().some(x => x.toLowerCase() === v.toLowerCase())) {
      this.values.set([...this.values(), v]);
    }
    this.draft.set('');
  }

  remove(i: number): void {
    this.values.set(this.values().filter((_, idx) => idx !== i));
  }
}
