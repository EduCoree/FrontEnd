// import { Component, inject, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import { AdminSidebarComponent } from '../../layouts/admin-sidebar/admin-sidebar';
// import { DashboardService } from '../../core/services/dashboard';
// import {
//   AdminDashboard,
//   TrendPoint,
//   TopCourse,
// } from '../../core/models/dashboard';
// import { TranslateModule } from '@ngx-translate/core';

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,
//   imports: [CommonModule, RouterLink, AdminSidebarComponent , TranslateModule],
//   templateUrl: './admin-dashboard.html',
// })
// export class AdminDashboardComponent implements OnInit {
//   private dashboardService = inject(DashboardService);

//   loading = signal(true);
//   kpis = signal<AdminDashboard | null>(null);
//   enrollmentTrend = signal<TrendPoint[]>([]);
//   revenueTrend = signal<TrendPoint[]>([]);
//   topCourses = signal<TopCourse[]>([]);
//   trendDays = signal<number>(30);

//   // Chart helpers
//   enrollmentMax = signal(0);
//   revenueMax = signal(0);

//   ngOnInit(): void {
//     this.loadAll();
//   }

//   loadAll(): void {
//     this.dashboardService.getAdminDashboard().subscribe({
//       next: (data) => {
//         this.kpis.set(data);
//         this.loading.set(false);
//       },
//       error: () => this.loading.set(false),
//     });

//     this.loadTrends(30);

//     this.dashboardService.getTopCourses().subscribe({
//       next: (data) => this.topCourses.set(data),
//     });
//   }

//   loadTrends(days: number): void {
//     this.trendDays.set(days);

//     this.dashboardService.getEnrollmentsTrend(days).subscribe({
//       next: (data) => {
//         this.enrollmentTrend.set(data);
//         this.enrollmentMax.set(Math.max(...data.map((d) => d.value), 1));
//       },
//     });

//     this.dashboardService.getRevenueTrend(days).subscribe({
//       next: (data) => {
//         this.revenueTrend.set(data);
//         this.revenueMax.set(Math.max(...data.map((d) => d.value), 1));
//       },
//     });
//   }

//   barHeight(value: number, max: number): number {
//     return max > 0 ? (value / max) * 100 : 0;
//   }

//   formatDate(dateStr: string): string {
//     const d = new Date(dateStr);
//     return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//   }

//   formatCurrency(value: number): string {
//     if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
//     return value.toString();
//   }

//   initials(name: string): string {
//     return name
//       .split(' ')
//       .map((w) => w[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   }
// }