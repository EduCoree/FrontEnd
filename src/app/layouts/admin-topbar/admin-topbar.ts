// src/app/layouts/admin-topbar/admin-topbar.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-topbar',
  imports: [CommonModule],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.css',
})
export class AdminTopbarComponent {
  @Input() placeholder = 'Search...';
}