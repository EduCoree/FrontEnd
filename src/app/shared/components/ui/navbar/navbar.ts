
import { OnInit } from '@angular/core';
// src/app/layouts/navbar/navbar.ts


import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive ,RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { UserService } from '../../../../core/services/user';
import { LanguageService } from '../../../../core/services/language.service'; 
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-navbar',
  
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule,TranslateModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  auth = inject(AuthService);
  user = inject(UserService);
  private router = inject(Router);
  private langService = inject(LanguageService); 

  userProfile$ = this.user.getMe();
  mobileMenuOpen = signal(false);
  currentLang = this.langService.currentLang; 

  switchLang() { 
    this.langService.toggle();
  }

  logout() {
    const refreshToken = this.auth.getRefreshToken();
    if (refreshToken) {
      this.auth.logout(refreshToken).subscribe();
    }
    this.auth.clearUser();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    const token = this.auth.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        ?? payload['role'] ?? [];
      return Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
    } catch {
      return false;
    }
  }

  get userInitials(): string {
    return (this.auth.currentUser()?.name ?? '')
      .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement;
    if (fallback) fallback.style.display = 'flex';
  }
}