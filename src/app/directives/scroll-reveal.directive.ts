import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() revealDelay = 0;
  @Input() revealThreshold = 0.12;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Check if running in browser and IntersectionObserver is supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    // Add base reveal initialization class
    this.renderer.addClass(this.el.nativeElement, 'reveal-init');
    
    if (this.revealDelay > 0) {
      this.renderer.setStyle(this.el.nativeElement, 'transition-delay', `${this.revealDelay}ms`);
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(this.el.nativeElement, 'revealed');
          this.observer?.unobserve(this.el.nativeElement);
        }
      });
    }, {
      threshold: this.revealThreshold,
      rootMargin: '0px 0px -40px 0px'
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
