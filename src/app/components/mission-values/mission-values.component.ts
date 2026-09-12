import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-mission-values',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './mission-values.component.html',
  styleUrl: './mission-values.component.css'
})
export class MissionValuesComponent {
  public ts = inject(TranslationService);
}
