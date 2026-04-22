// src/app/layouts/admin-sidebar/admin-sidebar.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive , TranslateModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebarComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  isOpen = signal(true);

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

 navItems = [
  { label: 'adminSidebar.dashboard', icon: 'dashboard', route: '/admin/dashboard', exact: false },
  { label: 'adminSidebar.courses', icon: 'school', route: '/admin/courses', exact: false },
  { label: 'adminSidebar.teachers', icon: 'person_4', route: '/admin/teachers', exact: false },
  { label: 'adminSidebar.students', icon: 'group', route: '/admin/students', exact: false },
  { label: 'adminSidebar.forumReports', icon: 'flag', route: '/admin/forum/reports', exact: false },
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