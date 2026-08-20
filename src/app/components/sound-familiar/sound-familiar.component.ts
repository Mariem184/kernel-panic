import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

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
  items: ProblemSolutionItem[] = [
    {
      problem: 'Your systems are vulnerable.',
      solution: 'Strengthen your cybersecurity.'
    },
    {
      problem: 'Your network is slow or unreliable.',
      solution: 'Build a stable and secure network infrastructure.'
    },
    {
      problem: 'Your business needs custom software.',
      solution: 'Develop software tailored to your workflow.'
    },
    {
      problem: 'Your team needs stronger technical skills.',
      solution: 'Train with practical, career-focused programs.'
    }
  ];
}
