
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
 isOpen = signal(true);

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  navItems = [
    {
      label: 'Centers',
      icon: 'business',
      route: '/centers',
      exact: true
    },
    {
      label: 'Edit Center',
      icon: 'person_edit',
      route: '/centers/11/edit',
      exact: false
    },
    {
      label: 'Update Logo',
      icon: 'upload',
      route: '/centers/11/logo',
      exact: false
    },
    {
      label: 'Categories',
      icon: 'category',
      route: '/centers/11/categories',
      exact: false
    }
  ];
}
