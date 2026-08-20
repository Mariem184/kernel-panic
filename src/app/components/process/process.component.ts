import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

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
  steps: ProcessStep[] = [
    {
      stepNumber: '01',
      title: 'Understand',
      description: 'We listen to your business needs and technical challenges.'
    },
    {
      stepNumber: '02',
      title: 'Analyze',
      description: 'We assess your current environment and identify opportunities for improvement.'
    },
    {
      stepNumber: '03',
      title: 'Build',
      description: 'We design and implement the right technology solution.'
    },
    {
      stepNumber: '04',
      title: 'Support',
      description: 'We continue to help you maintain, improve, and scale your solution.'
    }
  ];
}
