import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface SocialLink {
  name: string;
  subtitle: string;
  link: string;
  iconType: string;
}

@Component({
  selector: 'app-stay-connected',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './stay-connected.component.html',
  styleUrl: './stay-connected.component.css'
})
export class StayConnectedComponent {
  socialLinks: SocialLink[] = [
    { 
      name: 'WhatsApp', 
      subtitle: '01091610085', 
      link: 'https://wa.me/201091610085', 
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
      link: 'https://linkedin.com/company/kernel-panic', 
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
