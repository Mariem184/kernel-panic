import { Component, computed, inject } from '@angular/core';
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
  imports: [CommonModule, ScrollRevealDirective],
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
}
