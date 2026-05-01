import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';





interface NavItem {
  route: string;
  icon: string;
  labelKey: string;
  exact?: boolean;
}



@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive , TranslateModule],
  templateUrl: './student-layout.component.html',
})
export class StudentLayoutComponent {
  private _isOpen = signal(true);
  
    isOpen() {
      return this._isOpen();
    }
  
    toggle() {
      this._isOpen.update(v => !v);
    }
  
    getToggleIcon(): string {
      return this._isOpen() ? 'chevron_left' : 'chevron_right';
    }
  
 navItems: NavItem[] = [
  { route: '/student/dashboard',    icon: 'dashboard',    labelKey: 'studentSidebar.dashboard',    exact: true },
  { route: '/student/my-courses',   icon: 'menu_book',    labelKey: 'studentSidebar.myCourses' },
  { route: '/student/reviews',      icon: 'rate_review',  labelKey: 'studentSidebar.reviews' },
  { route: '/student/quizzes',      icon: 'quiz',         labelKey: 'studentSidebar.myQuizzes' },
  { route: '/student/quiz-history', icon: 'history',      labelKey: 'studentSidebar.QuizHistory' },
  { route: '/student/sessions',     icon: 'podcasts',     labelKey: 'studentSidebar.liveSessions' },
  { route: '/student/certificates', icon: 'verified',     labelKey: 'studentSidebar.certificates' },
    { route: '/student/payment-history',      icon: 'payments',         labelKey: 'studentSidebar.payments' },
  { route: '/student/settings',     icon: 'settings',     labelKey: 'studentSidebar.settings' },
  { route: '/student/support',      icon: 'help',         labelKey: 'studentSidebar.support' },

];
}