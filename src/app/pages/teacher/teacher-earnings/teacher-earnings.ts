import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TeacherPayoutService } from '../../../core/services/teacher-payout';
import { TeacherEarningDto } from '../../../core/models/payout.model';

import { MoneyDisplayComponent } from '../../../shared/components/money-display/money-display';
import { InvoiceStatusBadgeComponent } from '../../../shared/components/invoice-status-badge/invoice-status-badge';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { TranslateModule } from '@ngx-translate/core';
import { TeacherLayoutComponent } from "../../../layouts/teacher-layout/teacher-layout.component";

@Component({
  selector: 'app-teacher-earnings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MoneyDisplayComponent,
    InvoiceStatusBadgeComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    TranslateModule,
    TeacherLayoutComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-earnings.html',
})
export class TeacherEarningsComponent implements OnInit {
  private payoutService = inject(TeacherPayoutService);

  // ── State ────────────────────────────────────────────────────────
  loading = signal(true);
  error = signal<string | null>(null);

  earnings = signal<TeacherEarningDto[]>([]);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(10);

  // Filters (bound to inputs via ngModel)
  fromDate = signal<string>('');
  toDate = signal<string>('');

  // Computed
  totalPages = () => Math.ceil(this.totalCount() / this.pageSize());
  pages = () => {
    const total = this.totalPages();
    const current = this.pageNumber();
    const range: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  // ── Lifecycle ────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadEarnings();
  }

  loadEarnings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.payoutService
      .getMyEarnings(
        { pageNumber: this.pageNumber(), pageSize: this.pageSize() },
        this.fromDate() || null,
        this.toDate() || null,
      )
      .subscribe({
        next: (page) => {
          this.earnings.set(page.items);
          this.totalCount.set(page.totalCount);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load earnings', err);
          this.error.set('Could not load earnings.');
          this.loading.set(false);
        },
      });
  }

  // ── Filter handlers ──────────────────────────────────────────────

  applyFilters(): void {
    this.pageNumber.set(1); // reset to first page when filters change
    this.loadEarnings();
  }

  clearFilters(): void {
    this.fromDate.set('');
    this.toDate.set('');
    this.applyFilters();
  }

  // ── Pagination ────────────────────────────────────────────────────

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) return;
    this.pageNumber.set(page);
    this.loadEarnings();
  }
}