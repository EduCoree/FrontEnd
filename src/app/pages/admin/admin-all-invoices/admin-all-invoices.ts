import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminPayoutService } from '../../../core/services/admin-payout';
import { InvoiceStatus, TeacherInvoiceDto } from '../../../core/models/payout.model';

import { MoneyDisplayComponent } from '../../../shared/components/money-display/money-display';
import { InvoiceStatusBadgeComponent } from '../../../shared/components/invoice-status-badge/invoice-status-badge';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-admin-all-invoices',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MoneyDisplayComponent,
    InvoiceStatusBadgeComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-all-invoices.html',
})
export class AdminAllInvoicesComponent implements OnInit {
  private adminService = inject(AdminPayoutService);
  private router = inject(Router);

  // ── State ────────────────────────────────────────────────────────
  loading = signal(true);
  error = signal<string | null>(null);

  invoices = signal<TeacherInvoiceDto[]>([]);
  totalCount = signal(0);
  pageNumber = signal(1);
  pageSize = signal(15);

  // Filters
  statusFilter = signal<InvoiceStatus | ''>('');
  teacherIdFilter = signal<string>('');
  fromDate = signal<string>('');
  toDate = signal<string>('');

  readonly statusOptions: { value: InvoiceStatus | ''; label: string }[] = [
    { value: '',          label: 'All' },
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

  // ── Lifecycle ─────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.error.set(null);

    const status = this.statusFilter();

    this.adminService
      .getAllInvoices(
        { pageNumber: this.pageNumber(), pageSize: this.pageSize() },
        {
          status: status === '' ? null : status,
          teacherId: this.teacherIdFilter() || null,
          from: this.fromDate() || null,
          to: this.toDate() || null,
        },
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

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadInvoices();
  }

  clearFilters(): void {
    this.statusFilter.set('');
    this.teacherIdFilter.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.applyFilters();
  }

  /** True if any filter is active */
  hasActiveFilters = () =>
    this.statusFilter() !== '' ||
    this.teacherIdFilter() !== '' ||
    this.fromDate() !== '' ||
    this.toDate() !== '';

  // ── Pagination ────────────────────────────────────────────────────

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.pageNumber()) return;
    this.pageNumber.set(page);
    this.loadInvoices();
  }

  // Navigate to detail page
  openInvoice(id: number): void {
    this.router.navigate(['/admin/payout/invoices', id]);
  }
}