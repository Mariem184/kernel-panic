import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-mission-values',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './mission-values.component.html',
  styleUrl: './mission-values.component.css'
})
export class MissionValuesComponent {}
