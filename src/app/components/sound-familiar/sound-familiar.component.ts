import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TranslationService } from '../../services/translation.service';

interface ProblemSolutionItem {
  problem: string;
  solution: string;
}

@Component({
  selector: 'app-sound-familiar',
  standalone: true,
  imports: [SectionHeadingComponent, CommonModule, ScrollRevealDirective],
  templateUrl: './sound-familiar.component.html',
  styleUrl: './sound-familiar.component.css'
})
export class SoundFamiliarComponent {
  public ts = inject(TranslationService);

  items = computed<ProblemSolutionItem[]>(() => [
    {
      problem: this.ts.t('soundFamiliar.card1.title'),
      solution: this.ts.t('soundFamiliar.card1.desc')
    },
    {
      problem: this.ts.t('soundFamiliar.card2.title'),
      solution: this.ts.t('soundFamiliar.card2.desc')
    },
    {
      problem: this.ts.t('soundFamiliar.card3.title'),
      solution: this.ts.t('soundFamiliar.card3.desc')
    },
    {
      problem: this.ts.t('soundFamiliar.card4.title'),
      solution: this.ts.t('soundFamiliar.card4.desc')
    }
  ]);

  /** Accordion: the first challenge starts open so the pattern reads immediately;
   *  clicking a row toggles it, and only one is open at a time. */
  openIndex = signal<number | null>(0);

  toggle(i: number): void {
    this.openIndex.update(cur => (cur === i ? null : i));
  }
}
