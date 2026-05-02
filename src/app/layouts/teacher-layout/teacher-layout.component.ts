import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './teacher-layout.component.html',
})
export class TeacherLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  langService = inject(LanguageService);

  isOpen = signal(true);

  get isEditCourseRoute(): boolean {
    const url = this.router.url;
    return url.startsWith('/teacher/courses/edit/')
        || url.startsWith('/teacher/courses/create')
        || /^\/teacher\/courses\/\d+\/sections/.test(url);
  }

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

  navItems = [
    { route: '/teacher/dashboard',        icon: 'dashboard',    label: 'teacherDashboard.title',          exact: true },
    { route: '/teacher/courses',          icon: 'school',       label: 'myCourses.title' },
    { route: '/teacher/payout/dashboard', icon: 'payments',     label: 'teacherPortal.payoutDashboard' },
    { route: '/teacher/reviews',          icon: 'rate_review',  label: 'teacherReviews.studentFeedback' },
    // { route: '/teacher/settings',         icon: 'settings',     label: 'teacherPortal.settings' },
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
