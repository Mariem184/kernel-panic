import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  public ts = inject(TranslationService);
  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = 'hero';

  sections = ['hero', 'about', 'services', 'process', 'why-us', 'contact'];

  ngOnInit() {
    this.updateActiveSection();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
    this.updateActiveSection();
  }

  setActive(sectionId: string) {
    this.activeSection = sectionId;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  private updateActiveSection() {
    if (typeof window === 'undefined') return;
    const scrollPosition = window.scrollY + 140;
    for (const sectionId of this.sections) {
      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          this.activeSection = sectionId;
          break;
        }
      }
    }
  }
}
