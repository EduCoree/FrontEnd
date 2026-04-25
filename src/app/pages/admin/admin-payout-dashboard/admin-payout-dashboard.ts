import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

import { AdminPayoutService } from '../../../core/services/admin-payout';
import { AdminPayoutDashboardDto } from '../../../core/models/payout.model';

import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { MoneyDisplayComponent } from '../../../shared/components/money-display/money-display';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';

@Component({
  selector: 'app-admin-payout-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NgApexchartsModule,
    KpiCardComponent,
    MoneyDisplayComponent,
    LoadingSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-payout-dashboard.html',
})
export class AdminPayoutDashboardComponent implements OnInit {
  private adminService = inject(AdminPayoutService);

  // ── State ──────────────────────────────────────────────────────────
  loading = signal(true);
  error = signal<string | null>(null);
  dashboard = signal<AdminPayoutDashboardDto | null>(null);

  // Excel export state
  exportFrom = signal<string>('');
  exportTo = signal<string>('');
  exporting = signal(false);

  // ── Chart options ─────────────────────────────────────────────────

  /**
   * Donut chart showing the platform vs teacher split for the current month.
   * Computed from the loaded dashboard so it auto-updates.
   */
  splitChartOptions = (): Partial<ApexOptions> | null => {
    const d = this.dashboard();
    if (!d) return null;

    const total = d.currentMonthTeacherEarnings + d.currentMonthPlatformRevenue;
    if (total <= 0) return null;

    return {
      chart: { type: 'donut', height: 280, fontFamily: 'inherit' },
      series: [d.currentMonthTeacherEarnings, d.currentMonthPlatformRevenue],
      labels: ['Teacher Earnings', 'Platform Revenue'],
      colors: ['#2e6858', '#894e47'],
      legend: { position: 'bottom', fontSize: '13px' },
      plotOptions: {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Revenue',
                formatter: () => `${total.toLocaleString()} ${d.currency}`,
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${(val as number).toFixed(1)}%`,
      },
      tooltip: {
        y: { formatter: (v) => `${v.toLocaleString()} ${d.currency}` },
      },
    };
  };

  // ── Lifecycle ─────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadDashboard();

    // Default export range = current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.exportFrom.set(firstDay.toISOString().slice(0, 10));
    this.exportTo.set(now.toISOString().slice(0, 10));
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load admin dashboard', err);
        this.error.set('Could not load dashboard data.');
        this.loading.set(false);
      },
    });
  }

  // ── Excel Export ──────────────────────────────────────────────────

  downloadReport(): void {
    if (this.exporting()) return;
    this.exporting.set(true);

    const from = this.exportFrom() || null;
    const to = this.exportTo() || null;

    this.adminService.downloadFinancialReport(from, to).subscribe({
      next: (blob) => {
        // Use a meaningful filename: "EduCore-FinancialReport-YYYY-MM-DD_YYYY-MM-DD.xlsx"
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = `EduCore-FinancialReport-${from || 'all'}_${to || 'all'}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
        this.exporting.set(false);
      },
      error: (err) => {
        console.error('Excel export failed', err);
        alert('Could not generate the report. Please try again.');
        this.exporting.set(false);
      },
    });
  }
}