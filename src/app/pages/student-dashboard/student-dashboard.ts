import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard';
import { StudentDashboard } from '../../core/models/dashboard';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './student-dashboard.html',
})
export class StudentDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal(true);
  dashboard = signal<StudentDashboard | null>(null);

  ngOnInit(): void {
    this.dashboardService.getStudentDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  timeUntil(dateStr: string): string {
    const diff = new Date(dateStr).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  }

  scoreColor(passed: boolean): string {
    return passed ? 'text-[#2e6959] bg-[#b2efda]' : 'text-[#a83836] bg-[#ffdad6]';
  }
}