import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TeacherPayoutService } from '../../../core/services/teacher-payout';
import { InvoiceStatus, TeacherInvoiceDto } from '../../../core/models/payout.model';

import { MoneyDisplayComponent } from '../../../shared/components/money-display/money-display';
import { InvoiceStatusBadgeComponent } from '../../../shared/components/invoice-status-badge/invoice-status-badge';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-teacher-invoices',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MoneyDisplayComponent,
    InvoiceStatusBadgeComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    TranslateModule

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-invoices.html',
})
export class TeacherInvoicesComponent implements OnInit {
  private payoutService = inject(TeacherPayoutService);

  // ── State ────────────────────────────────────────────────────────
  loading = signal(true);
  error = signal<string | null>(null);

  invoices = signal<TeacherInvoiceDto[]>([]);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(10);

  statusFilter = signal<InvoiceStatus | ''>('');

  // For the filter dropdown
  readonly statusOptions: { value: InvoiceStatus | ''; label: string }[] = [
    { value: '',          label: 'All Statuses' },
    { value: 'Issued',    label: 'Awaiting Payment' },
    { value: 'Paid',      label: 'Paid' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Draft',     label: 'Draft' },
  ];

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
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.error.set(null);

    const status = this.statusFilter();

    this.payoutService
      .getMyInvoices(
        { pageNumber: this.pageNumber(), pageSize: this.pageSize() },
        status === '' ? null : status,
      )
      .subscribe({
        next: (page) => {
          this.invoices.set(page.items);
          this.totalCount.set(page.totalCount);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load invoices', err);
          this.error.set('Could not load invoices.');
          this.loading.set(false);
        },
      });
  }

  // ── Filter handlers ──────────────────────────────────────────────

  onStatusChange(value: InvoiceStatus | ''): void {
    this.statusFilter.set(value);
    this.pageNumber.set(1);
    this.loadInvoices();
  }

  // ── Pagination ────────────────────────────────────────────────────

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) return;
    this.pageNumber.set(page);
    this.loadInvoices();
  }
}