import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private translate = inject(TranslateService);
  private auth = inject(AuthService);

  isOpen = signal(true);

  get isAdmin(): boolean {
    return this.auth.hasRole('Admin');
  }

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  get isRtl(): boolean {
    return this.translate.currentLang === 'ar';
  }

  getToggleIcon(): string {
    const open = this.isOpen();
    const rtl = this.isRtl;

    if (open) {
      return rtl ? 'chevron_right' : 'chevron_left';
    } else {
      return rtl ? 'chevron_left' : 'chevron_right';
    }
  }

  navItems = [
    { labelKey: 'sidebar.centers',    icon: 'business',    route: '/centers/11',            exact: true,  requiresAdmin: false },
    { labelKey: 'sidebar.editCenter', icon: 'person_edit', route: '/centers/11/edit',       exact: false, requiresAdmin: false },
    { labelKey: 'sidebar.updateLogo', icon: 'upload',      route: '/centers/11/logo',       exact: false, requiresAdmin: false },
    { labelKey: 'sidebar.categories', icon: 'category',    route: '/centers/11/categories', exact: false, requiresAdmin: false },
    { labelKey: 'FORUM REPORTS',      icon: 'flag',        route: '/admin/forum/reports',   exact: false, requiresAdmin: true  },
  ];
}