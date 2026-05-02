import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth';

interface NavItem {
  route: string;
  icon: string;
  labelKey: string;
  exact?: boolean;
}

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './student-layout.component.html',
})
export class StudentLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  langService = inject(LanguageService);

  isOpen = signal(true);

  get isRtl(): boolean {
    return this.langService.currentLang() === 'ar';
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  getToggleIcon(): string {
    const open = this.isOpen();
    const rtl = this.isRtl;
    if (open) return rtl ? 'chevron_right' : 'chevron_left';
    return rtl ? 'chevron_left' : 'chevron_right';
  }

  navItems: NavItem[] = [
    { route: '/student/dashboard',       icon: 'dashboard',    labelKey: 'studentSidebar.dashboard',    exact: true },
    { route: '/student/my-courses',      icon: 'menu_book',    labelKey: 'studentSidebar.myCourses' },
    { route: '/student/reviews',         icon: 'rate_review',  labelKey: 'studentSidebar.reviews' },
    { route: '/student/quizzes',         icon: 'quiz',         labelKey: 'studentSidebar.myQuizzes' },
    { route: '/student/quiz-history',    icon: 'history',      labelKey: 'studentSidebar.QuizHistory' },
    { route: '/student/sessions',        icon: 'podcasts',     labelKey: 'studentSidebar.liveSessions' },
    { route: '/student/certificates',    icon: 'verified',     labelKey: 'studentSidebar.certificates' },
    { route: '/student/payment-history', icon: 'payments',     labelKey: 'studentSidebar.payments' },
    // { route: '/student/settings',        icon: 'settings',     labelKey: 'studentSidebar.settings' },
    // { route: '/student/support',         icon: 'help',         labelKey: 'studentSidebar.support' },
  ];

  logout() {
    const refreshToken = this.auth.getRefreshToken();
    if (refreshToken) this.auth.logout(refreshToken).subscribe();
    this.auth.clearUser();
    this.router.navigate(['/login']);
  }

  get userInitials(): string {
    return (this.auth.currentUser()?.name ?? '')
      .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  get userName(): string {
    return this.auth.currentUser()?.name ?? '';
  }
}