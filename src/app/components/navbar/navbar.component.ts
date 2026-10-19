import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { TeamAccountsComponent } from '../team-accounts/team-accounts.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TeamAccountsComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  public ts = inject(TranslationService);
  public auth = inject(AuthService);
  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = 'hero';

  sections = ['hero', 'about', 'services', 'projects', 'why-us', 'process', 'news', 'contact'];

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

  /** Admin-only "Team accounts" pop-up (add editors who can post news & projects). */
  teamOpen = false;
  openTeam() {
    this.teamOpen = true;
    this.closeMobileMenu();
  }

  logout() {
    this.teamOpen = false;
    this.auth.logout();
    this.closeMobileMenu();
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
