// src/app/layouts/admin-topbar/admin-topbar.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-topbar',
  imports: [CommonModule , TranslateModule],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.css',
})
export class AdminTopbarComponent {
  @Input() placeholder = 'Search...';
}