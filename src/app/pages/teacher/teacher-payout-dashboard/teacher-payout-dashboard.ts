import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';

import { TeacherPayoutService } from '../../../core/services/teacher-payout';
import {
  CurrentMonthEarningsDto,
  PayoutSettingsDto,
  TeacherEarningDto,
  TeacherEarningsSummaryDto,
} from '../../../core/models/payout.model';

import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card';
import { MoneyDisplayComponent } from '../../../shared/components/money-display/money-display';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { InvoiceStatusBadgeComponent } from '../../../shared/components/invoice-status-badge/invoice-status-badge';
import { TranslateModule } from '@ngx-translate/core';
import { TeacherLayoutComponent } from "../../../layouts/teacher-layout/teacher-layout.component";

@Component({
  selector: 'app-teacher-payout-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgApexchartsModule,
    KpiCardComponent,
    MoneyDisplayComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    InvoiceStatusBadgeComponent,
    TranslateModule,
    TeacherLayoutComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-payout-dashboard.html',
})
export class TeacherPayoutDashboardComponent implements OnInit {
  private payoutService = inject(TeacherPayoutService);

  // ── State ──────────────────────────────────────────────────────────
  loading = signal(true);
  error = signal<string | null>(null);

  summary = signal<TeacherEarningsSummaryDto | null>(null);
  currentMonth = signal<CurrentMonthEarningsDto | null>(null);
  settings = signal<PayoutSettingsDto | null>(null);
  recentEarnings = signal<TeacherEarningDto[]>([]);

  // ── Computed: tier progress ─────────────────────────────────────────

  /**
   * Percentage progress to next tier (0-100).
   * Capped at 100 even if user already exceeded a threshold.
   */
  tierProgressPercent = computed(() => {
    const cm = this.currentMonth();
    if (!cm || !cm.nextTierThreshold) return 100; // already at max tier

    // Determine the *previous* threshold to compute progress within the current band
    const previousThreshold = this.previousTierThreshold();
    const range = cm.nextTierThreshold - previousThreshold;
    if (range <= 0) return 100;

    const within = cm.paidEnrollmentsCount - previousThreshold;
    const pct = (within / range) * 100;
    return Math.max(0, Math.min(100, pct));
  });

  previousTierThreshold = computed(() => {
    const cm = this.currentMonth();
    const s = this.settings();
    if (!cm || !s || !cm.nextTierThreshold) return 0;

    if (cm.nextTierThreshold === s.tier1Threshold) return 0;
    if (cm.nextTierThreshold === s.tier2Threshold) return s.tier1Threshold;
    if (cm.nextTierThreshold === s.tier3Threshold) return s.tier2Threshold;
    return 0;
  });

  /**
   * Bar chart options reflecting projected current-month earnings as a single bar.
   * For richer multi-month history we'd need a backend method; this gives an
   * immediate visual anchor without an extra API call.
   */
  chartOptions = computed<Partial<ApexOptions> | null>(() => {
    const cm = this.currentMonth();
    const summary = this.summary();
    if (!cm || !summary) return null;

    return {
      chart: {
        type: 'bar',
        height: 280,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      series: [
        {
          name: 'Earnings (this month)',
          data: [cm.earningsTotal],
        },
        {
          name: 'Tier Bonus (projected)',
          data: [cm.projectedTierBonus],
        },
      ],
      xaxis: {
        categories: [`${this.monthName(cm.month)} ${cm.year}`],
        labels: { style: { fontSize: '12px' } },
      },
      yaxis: {
        labels: {
          formatter: (val) => `${this.shortNumber(val)} ${cm.currency}`,
          style: { fontSize: '11px' },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '38%',
          borderRadius: 8,
          borderRadiusApplication: 'end',
        },
      },
      colors: ['#2e6858', '#7db8a5'],
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
      grid: { borderColor: '#e1e3e3', strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (val) => `${val.toLocaleString()} ${cm.currency}` },
      },
    };
  });

  // ── Lifecycle ─────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load everything in parallel — the dashboard needs all of them anyway
    forkJoin({
      summary: this.payoutService.getEarningsSummary(),
      currentMonth: this.payoutService.getCurrentMonthPreview(),
      settings: this.payoutService.getPayoutSettings(),
      recentEarnings: this.payoutService.getMyEarnings({ pageNumber: 1, pageSize: 5 }),
    }).subscribe({
      next: (data) => {
        this.summary.set(data.summary);
        this.currentMonth.set(data.currentMonth);
        this.settings.set(data.settings);
        this.recentEarnings.set(data.recentEarnings.items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard', err);
        this.error.set('Could not load dashboard data. Please try again.');
        this.loading.set(false);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────

  monthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] ?? '';
  }

  shortNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  }
}