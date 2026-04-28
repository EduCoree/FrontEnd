import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from '../../../layouts/admin-sidebar/admin-sidebar';
import { PaymentService } from '../../../core/services/payment.service';
import { CashPaymentRequestDto, PaymentDto } from '../../../core/models/enrollment.models';
import { AdminCashRequestService } from '../../../core/services/AdminCashRequest.Service';
@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule,   AdminSidebarComponent],
  templateUrl: './admin-payments.component.html',
})
export class AdminPaymentsComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private cashRequestService = inject(AdminCashRequestService);

  // Tabs
  activeTab = signal<'payments' | 'cash-requests'>('payments');

  // Payments
  payments = signal<PaymentDto[]>([]);
  paymentsLoading = signal(false);
  paymentsFilter = signal<'All' | 'Completed' | 'Pending' | 'Failed'>('All');

  // Cash Requests
  cashRequests = signal<CashPaymentRequestDto[]>([]);
  cashLoading = signal(false);
cashFilter = signal<'All' | 'Pending' | 'Confirmed' | 'Rejected'>('All');
cashFilterOptions: ('All' | 'Pending' | 'Confirmed' | 'Rejected')[] = ['All', 'Pending', 'Confirmed', 'Rejected'];
paymentsFilterOptions: ('All' | 'Completed' | 'Pending' | 'Failed')[] = ['All', 'Completed', 'Pending', 'Failed'];
  successMsg = signal('');
  errorMsg = signal('');

  // Computed
  filteredPayments = computed(() => {
    const f = this.paymentsFilter();
    if (f === 'All') return this.payments();
    return this.payments().filter(p => p.status === f);
  });

  filteredCashRequests = computed(() => {
    const f = this.cashFilter();
    if (f === 'All') return this.cashRequests();
    return this.cashRequests().filter(r => r.status === f);
  });

  pendingCashCount = computed(() =>
    this.cashRequests().filter(r => r.status === 'Pending').length
  );

  totalRevenue = computed(() =>
    this.payments()
      .filter(p => p.status === 'Completed')
      .reduce((acc, p) => acc + p.amount, 0)
  );

  ngOnInit(): void {
    this.loadPayments();
    this.loadCashRequests();
  }

  loadPayments(): void {
    this.paymentsLoading.set(true);
    this.paymentService.getAllPayments({ pageNumber: 1, pageSize: 50 }).subscribe({
      next: (res) => {
        this.payments.set(res.data.items);
        this.paymentsLoading.set(false);
      },
      error: () => this.paymentsLoading.set(false)
    });
  }

  loadCashRequests(): void {
    this.cashLoading.set(true);
    this.cashRequestService.getAll().subscribe({
      next: (res) => {
        this.cashRequests.set(res.data);
        this.cashLoading.set(false);
      },
      error: () => this.cashLoading.set(false)
    });
  }

  confirmRequest(id: number): void {
    this.cashRequestService.confirm(id).subscribe({
      next: () => {
        this.cashRequests.update(list =>
          list.map(r => r.id === id ? { ...r, status: 'Confirmed' as const } : r)
        );
        this.flash('Request confirmed and student enrolled successfully.');
        this.loadPayments();
      },
      error: (err) => this.flashError(err?.error?.message ?? 'Failed to confirm.')
    });
  }

  rejectRequest(id: number): void {
    this.cashRequestService.reject(id).subscribe({
      next: () => {
        this.cashRequests.update(list =>
          list.map(r => r.id === id ? { ...r, status: 'Rejected' as const } : r)
        );
        this.flash('Request rejected.');
      },
      error: (err) => this.flashError(err?.error?.message ?? 'Failed to reject.')
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Pending':   return 'bg-orange-100 text-orange-700';
      case 'Failed':    return 'bg-red-100 text-red-700';
      case 'Cancelled': return 'bg-surface-container-high text-on-surface-variant';
      default:          return 'bg-surface-container text-on-surface-variant';
    }
  }

  getCashStatusClass(status: string): string {
    switch (status) {
      case 'Pending':   return 'bg-tertiary-container/30 text-on-tertiary-container';
      case 'Confirmed': return 'bg-primary/10 text-primary';
      case 'Rejected':  return 'bg-error-container/10 text-error';
      default:          return 'bg-surface-container text-on-surface-variant';
    }
  }

  getMethodIcon(method: string): string {
    switch (method) {
      case 'Card': return 'credit_card';
      case 'Cash': return 'payments';
      case 'Free': return 'redeem';
      default:     return 'receipt';
    }
  }

  private flash(msg: string): void {
    this.errorMsg.set('');
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3500);
  }

  private flashError(msg: string): void {
    this.successMsg.set('');
    this.errorMsg.set(msg);
    setTimeout(() => this.errorMsg.set(''), 3500);
  }
}