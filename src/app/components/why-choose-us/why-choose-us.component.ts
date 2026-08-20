import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TranslationService } from '../../services/translation.service';

interface WhyChooseItem {
  number: string;
  title: string;
  description: string;
  iconType: string;
}

@Component({
  selector: 'app-why-choose-us',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './why-choose-us.component.html',
  styleUrl: './why-choose-us.component.css'
})
export class WhyChooseUsComponent {
  public ts = inject(TranslationService);

  reasons = computed<WhyChooseItem[]>(() => [
    {
      number: '01',
      title: this.ts.t('whyUs.feat1Title'),
      description: this.ts.t('whyUs.feat1Desc'),
      iconType: 'star'
    },
    {
      number: '02',
      title: this.ts.t('whyUs.feat2Title'),
      description: this.ts.t('whyUs.feat2Desc'),
      iconType: 'shield'
    },
    {
      number: '03',
      title: this.ts.t('whyUs.feat3Title'),
      description: this.ts.t('whyUs.feat3Desc'),
      iconType: 'globe'
    },
    {
      number: '04',
      title: this.ts.t('whyUs.feat4Title'),
      description: this.ts.t('whyUs.feat4Desc'),
      iconType: 'heart'
    }
  ]);
}
