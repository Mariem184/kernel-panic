import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-final-cta',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './final-cta.component.html',
  styleUrl: './final-cta.component.css'
})
export class FinalCtaComponent {
  public ts = inject(TranslationService);
}
