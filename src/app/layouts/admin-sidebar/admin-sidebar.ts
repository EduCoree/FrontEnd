// src/app/layouts/admin-sidebar/admin-sidebar.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebarComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

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