import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard';
import { TeacherDashboard } from '../../core/models/dashboard';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe , TranslateModule],
  templateUrl: './teacher-dashboard.html',
})
export class TeacherDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal(true);
  dashboard = signal<TeacherDashboard | null>(null);

  ngOnInit(): void {
    this.dashboardService.getTeacherDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  ratingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i);
  }

  timeUntil(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  }
}