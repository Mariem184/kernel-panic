import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TranslationService } from '../../services/translation.service';

interface ServiceItem {
  number: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  iconType: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  public ts = inject(TranslationService);

  services = computed<ServiceItem[]>(() => [
    {
      number: '01',
      title: this.ts.t('services.item1.title'),
      description: this.ts.t('services.item1.desc'),
      linkText: this.ts.currentLang() === 'ar' ? 'استكشف خدمات الأمن السيبراني' : 'Explore Cybersecurity',
      linkUrl: '#contact',
      iconType: 'shield'
    },
    {
      number: '02',
      title: this.ts.t('services.item2.title'),
      description: this.ts.t('services.item2.desc'),
      linkText: this.ts.currentLang() === 'ar' ? 'استكشف حلول الشبكات' : 'Explore Networking',
      linkUrl: '#contact',
      iconType: 'network'
    },
    {
      number: '03',
      title: this.ts.t('services.item3.title'),
      description: this.ts.t('services.item3.desc'),
      linkText: this.ts.currentLang() === 'ar' ? 'ابدأ مشروعك البرمجي' : 'Build Your Solution',
      linkUrl: '#contact',
      iconType: 'software'
    },
    {
      number: '04',
      title: this.ts.t('services.item4.title'),
      description: this.ts.t('services.item4.desc'),
      linkText: this.ts.currentLang() === 'ar' ? 'إدارة وتطوير البنية التحتية' : 'Optimize Your Infrastructure',
      linkUrl: '#contact',
      iconType: 'infra'
    },
    {
      number: '05',
      title: this.ts.t('services.item5.title'),
      description: this.ts.t('services.item5.desc'),
      linkText: this.ts.currentLang() === 'ar' ? 'عرض البرامج التدريبية' : 'View Training Programs',
      linkUrl: '#contact',
      iconType: 'training'
    }
  ]);
}
