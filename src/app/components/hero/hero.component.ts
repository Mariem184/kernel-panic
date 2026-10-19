import { Component, ElementRef, HostListener, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnDestroy {
  public ts = inject(TranslationService);
  private el = inject(ElementRef<HTMLElement>);

  /** Restrained pointer-responsive depth on the hero graphic — skipped entirely for
   *  touch devices (no meaningful pointer) and anyone who asked for reduced motion. */
  private readonly parallaxEnabled =
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  private rafId: number | null = null;
  private pendingX = 0;
  private pendingY = 0;

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.parallaxEnabled) return;
    // Normalize to roughly -1..1 from the viewport center.
    this.pendingX = (event.clientX / window.innerWidth - 0.5) * 2;
    this.pendingY = (event.clientY / window.innerHeight - 0.5) * 2;
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => this.applyParallax());
    }
  }

  private applyParallax(): void {
    this.rafId = null;
    const host = this.el.nativeElement;
    host.style.setProperty('--px', this.pendingX.toFixed(3));
    host.style.setProperty('--py', this.pendingY.toFixed(3));
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }
}
