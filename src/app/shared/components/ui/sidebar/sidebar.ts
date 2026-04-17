import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private translate = inject(TranslateService);

  isOpen = signal(true);

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
    { labelKey: 'sidebar.centers',    icon: 'business',    route: '/centers/11',            exact: true  },
    { labelKey: 'sidebar.editCenter', icon: 'person_edit', route: '/centers/11/edit',       exact: false },
    { labelKey: 'sidebar.updateLogo', icon: 'upload',      route: '/centers/11/logo',       exact: false },
    { labelKey: 'sidebar.categories', icon: 'category',    route: '/centers/11/categories', exact: false },
  ];
}