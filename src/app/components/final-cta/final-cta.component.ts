import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-final-cta',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './final-cta.component.html',
  styleUrl: './final-cta.component.css'
})
export class FinalCtaComponent {}
