import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

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
  services: ServiceItem[] = [
    {
      number: '01',
      title: 'Cybersecurity',
      description: 'Protect your systems, data, and networks with security-focused solutions designed to reduce risks and strengthen your digital environment.',
      linkText: 'Explore Cybersecurity',
      linkUrl: '#contact',
      iconType: 'shield'
    },
    {
      number: '02',
      title: 'Networking',
      description: 'Build reliable, scalable, and secure networks that keep your teams, systems, and business connected.',
      linkText: 'Explore Networking',
      linkUrl: '#contact',
      iconType: 'network'
    },
    {
      number: '03',
      title: 'Software Development',
      description: 'Build scalable, efficient, and user-friendly software solutions tailored to your business requirements.',
      linkText: 'Build Your Solution',
      linkUrl: '#contact',
      iconType: 'software'
    },
    {
      number: '04',
      title: 'IT Infrastructure',
      description: 'Design and optimize reliable IT infrastructure that supports performance, scalability, and business continuity.',
      linkText: 'Optimize Your Infrastructure',
      linkUrl: '#contact',
      iconType: 'infra'
    },
    {
      number: '05',
      title: 'Courses & Training',
      description: 'Practical technical training programs designed to develop skills and prepare learners for real-world technology careers.',
      linkText: 'View Training Programs',
      linkUrl: '#contact',
      iconType: 'training'
    }
  ];
}
