import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminPayoutService } from '../../../core/services/admin-payout';
import {
  PayoutMethod,
  TeacherInvoiceDetailDto,
} from '../../../core/models/payout.model';

import { MoneyDisplayComponent } from '../../../shared/components/money-display/money-display';
import { InvoiceStatusBadgeComponent } from '../../../shared/components/invoice-status-badge/invoice-status-badge';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MoneyDisplayComponent,
    InvoiceStatusBadgeComponent,
    LoadingSkeletonComponent,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-invoice-detail.html',
})
export class AdminInvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminPayoutService);

  // ── State ────────────────────────────────────────────────────────
  loading = signal(true);
  error = signal<string | null>(null);
  invoice = signal<TeacherInvoiceDetailDto | null>(null);
  downloading = signal(false);

  // Modals
  showPayModal = signal(false);
  showCancelModal = signal(false);
  submitting = signal(false);
  modalError = signal<string | null>(null);

  // Mark-as-Paid form fields
  payMethod = signal<PayoutMethod>('Cash');
  payReference = signal<string>('');
  payNotes = signal<string>('');

  // Cancel form fields
  cancelReason = signal<string>('');

  readonly payoutMethods: { value: PayoutMethod; label: string }[] = [
    { value: 'Cash',         label: 'Cash' },
    { value: 'BankTransfer', label: 'Bank Transfer' },
    { value: 'VodafoneCash', label: 'Vodafone Cash' },
    { value: 'InstaPay',     label: 'InstaPay' },
    { value: 'Other',        label: 'Other' },
  ];

  // ── Lifecycle ────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.router.navigate(['/admin/payout/invoices']);
      return;
    }
    this.loadInvoice(id);
  }

  loadInvoice(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getInvoiceDetail(id).subscribe({
      next: (data) => {
        this.invoice.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load invoice', err);
        this.error.set(err.status === 404 ? 'Invoice not found.' : 'Could not load this invoice.');
        this.loading.set(false);
      },
    });
  }

  // ── PDF download ──────────────────────────────────────────────────

  downloadPdf(): void {
    const inv = this.invoice();
    if (!inv || this.downloading()) return;

    this.downloading.set(true);
    this.adminService.downloadInvoicePdf(inv.id).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = `${inv.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
        this.downloading.set(false);
      },
      error: () => {
        alert('Could not download PDF.');
        this.downloading.set(false);
      },
    });
  }

  // ── Mark as Paid ──────────────────────────────────────────────────

  openPayModal(): void {
    this.payMethod.set('Cash');
    this.payReference.set('');
    this.payNotes.set('');
    this.modalError.set(null);
    this.showPayModal.set(true);
  }

  closePayModal(): void {
    if (this.submitting()) return;
    this.showPayModal.set(false);
  }

  confirmPayment(): void {
    const inv = this.invoice();
    if (!inv || this.submitting()) return;

    this.submitting.set(true);
    this.modalError.set(null);

    this.adminService
      .markInvoiceAsPaid(inv.id, {
        payoutMethod: this.payMethod(),
        payoutReference: this.payReference() || null,
        notes: this.payNotes() || null,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showPayModal.set(false);
          this.loadInvoice(inv.id); // refresh to show updated status
        },
        error: (err) => {
          console.error('Mark as paid failed', err);
          this.modalError.set(err?.error?.detail || err?.error?.message || 'Could not mark invoice as paid.');
          this.submitting.set(false);
        },
      });
  }

  // ── Cancel Invoice ────────────────────────────────────────────────

  openCancelModal(): void {
    this.cancelReason.set('');
    this.modalError.set(null);
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    if (this.submitting()) return;
    this.showCancelModal.set(false);
  }

  confirmCancel(): void {
    const inv = this.invoice();
    if (!inv || this.submitting()) return;

    if (this.cancelReason().trim().length < 5) {
      this.modalError.set('Please provide a reason (at least 5 characters).');
      return;
    }

    this.submitting.set(true);
    this.modalError.set(null);

    this.adminService.cancelInvoice(inv.id, { reason: this.cancelReason() }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showCancelModal.set(false);
        this.loadInvoice(inv.id);
      },
      error: (err) => {
        console.error('Cancel failed', err);
        this.modalError.set(err?.error?.detail || err?.error?.message || 'Could not cancel invoice.');
        this.submitting.set(false);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────

  /** Whether the "Mark as Paid" button should be visible */
  canMarkAsPaid = (): boolean => {
    const status = this.invoice()?.status;
    return status === 'Draft' || status === 'Issued';
  };

  /** Whether the "Cancel" button should be visible */
  canCancel = (): boolean => {
    const status = this.invoice()?.status;
    return status === 'Draft' || status === 'Issued';
  };
}