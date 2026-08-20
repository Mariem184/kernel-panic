import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

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
  reasons: WhyChooseItem[] = [
    {
      number: '01',
      title: 'Technical Expertise',
      description: 'Practical technical knowledge focused on solving real business problems, not just theoretical concepts.',
      iconType: 'star'
    },
    {
      number: '02',
      title: 'Security First',
      description: 'We put security and reliability at the core of every technology solution we build and deploy.',
      iconType: 'shield'
    },
    {
      number: '03',
      title: 'Tailored Solutions',
      description: 'Every business has different needs. Our solutions are carefully adapted to your specific goals.',
      iconType: 'globe'
    },
    {
      number: '04',
      title: 'Long-Term Partnership',
      description: 'We aim to become your trusted technology partner, not just another service provider.',
      iconType: 'heart'
    }
  ];
}
