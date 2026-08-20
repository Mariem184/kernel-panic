import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TranslationService } from '../../services/translation.service';

interface ProcessStep {
  stepNumber: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './process.component.html',
  styleUrl: './process.component.css'
})
export class ProcessComponent {
  public ts = inject(TranslationService);

  steps = computed<ProcessStep[]>(() => [
    {
      stepNumber: this.ts.t('process.step1Num'),
      title: this.ts.t('process.step1Title'),
      description: this.ts.t('process.step1Desc')
    },
    {
      stepNumber: this.ts.t('process.step2Num'),
      title: this.ts.t('process.step2Title'),
      description: this.ts.t('process.step2Desc')
    },
    {
      stepNumber: this.ts.t('process.step3Num'),
      title: this.ts.t('process.step3Title'),
      description: this.ts.t('process.step3Desc')
    },
    {
      stepNumber: this.ts.t('process.step4Num'),
      title: this.ts.t('process.step4Title'),
      description: this.ts.t('process.step4Desc')
    }
  ]);
}
