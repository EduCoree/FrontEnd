import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentDto } from '../../../core/models/enrollment.models';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-history.component.html',
})
export class PaymentHistoryComponent implements OnInit {

  payments: PaymentDto[] = [];
  isLoading = false;

  get totalSpent(): number {
    return this.payments
      .filter(p => p.status === 'Completed')
      .reduce((acc, p) => acc + p.amount, 0);
  }

  constructor(
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.paymentService.getMyPaymentHistory().subscribe({
      next: (res) => {
        this.payments = res.data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoading = false; }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-primary/10 text-primary';
      case 'Pending':   return 'bg-error-container/20 text-on-error-container';
      case 'Failed':    return 'bg-error/10 text-error';
      case 'Cancelled': return 'bg-surface-container-high text-on-surface-variant';
      default:          return 'bg-surface-container text-on-surface-variant';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-primary';
      case 'Pending':   return 'bg-error-container';
      case 'Failed':    return 'bg-error';
      default:          return 'bg-outline-variant';
    }
  }
}