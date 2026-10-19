import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { Component, computed, inject } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { TranslationService } from '../../services/translation.service';

interface SocialLink {
  name: string;
  subtitle: string;
  link: string;
  iconType: string;
}

@Component({
  selector: 'app-stay-connected',
  standalone: true,
  imports: [SectionHeadingComponent, CommonModule, NgTemplateOutlet, ScrollRevealDirective],
  templateUrl: './stay-connected.component.html',
  styleUrl: './stay-connected.component.css'
})
export class StayConnectedComponent {
  public ts = inject(TranslationService);

  // Continuous infinite-loop auto-scroll (CSS-only marquee; the duplicated-list
  // technique below is the same one used for the Projects thumbnail strip).
  // Pausing on hover/focus is handled purely in CSS (:hover / :focus-within).
  stripAnimDuration = computed(() => `${Math.max(this.socialLinks.length * 2.5, 14)}s`);

  socialLinks: SocialLink[] = [
    { 
      name: 'WhatsApp', 
      subtitle: '01507316744', 
      link: 'https://wa.me/201507316744', 
      iconType: 'whatsapp' 
    },
    { 
      name: 'WA Channel', 
      subtitle: 'Follow updates', 
      link: 'https://whatsapp.com/channel/0029VbD9n5YLikg6FPSg3f2Q', 
      iconType: 'channel' 
    },
    { 
      name: 'Email', 
      subtitle: 'kernelpanic177@gmail.com', 
      link: 'mailto:kernelpanic177@gmail.com', 
      iconType: 'email' 
    },
    { 
      name: 'LinkedIn', 
      subtitle: 'Kernel Panic', 
      link: 'https://www.linkedin.com/company/kernel-panik/', 
      iconType: 'linkedin' 
    },
    { 
      name: 'Facebook', 
      subtitle: 'Kernel Panic', 
      link: 'https://www.facebook.com/share/19YzjS7c7m/', 
      iconType: 'facebook' 
    },
    { 
      name: 'Instagram', 
      subtitle: '@kern.elpanic', 
      link: 'https://www.instagram.com/kern.elpanic?igsh=eWdwMjV2bWlwNDVu', 
      iconType: 'instagram' 
    },
    { 
      name: 'TikTok', 
      subtitle: '@kernel.panic28', 
      link: 'https://www.tiktok.com/@kernel.panic28?_r=1&_t=ZS-992uC2F2I0i', 
      iconType: 'tiktok' 
    },
  ];
}
