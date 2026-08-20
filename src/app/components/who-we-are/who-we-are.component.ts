import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-who-we-are',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './who-we-are.component.html',
  styleUrl: './who-we-are.component.css'
})
export class WhoWeAreComponent {
  public ts = inject(TranslationService);
}
