import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TeacherPayoutService } from '../../../core/services/teacher-payout';
import { TeacherInvoiceDetailDto } from '../../../core/models/payout.model';

import { MoneyDisplayComponent } from '../../../shared/components/money-display/money-display';
import { InvoiceStatusBadgeComponent } from '../../../shared/components/invoice-status-badge/invoice-status-badge';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';

@Component({
  selector: 'app-teacher-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MoneyDisplayComponent,
    InvoiceStatusBadgeComponent,
    LoadingSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teacher-invoice-detail.html',
})
export class TeacherInvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private payoutService = inject(TeacherPayoutService);

  // ── State ────────────────────────────────────────────────────────
  loading = signal(true);
  error = signal<string | null>(null);
  invoice = signal<TeacherInvoiceDetailDto | null>(null);

  /** Disable the download button during the request to avoid duplicate clicks */
  downloading = signal(false);

  // ── Lifecycle ────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.router.navigate(['/teacher/payout/invoices']);
      return;
    }
    this.loadInvoice(id);
  }

  loadInvoice(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.payoutService.getInvoiceDetail(id).subscribe({
      next: (data) => {
        this.invoice.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load invoice', err);
        this.error.set(err.status === 404
          ? 'Invoice not found.'
          : 'Could not load this invoice.');
        this.loading.set(false);
      },
    });
  }

  // ── PDF Download ──────────────────────────────────────────────────

  downloadPdf(): void {
    const inv = this.invoice();
    if (!inv || this.downloading()) return;

    this.downloading.set(true);

    this.payoutService.downloadInvoicePdf(inv.id).subscribe({
      next: (blob) => {
        // Convert Blob → trigger browser download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${inv.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: (err) => {
        console.error('Download failed', err);
        alert('Could not download the invoice. Please try again.');
        this.downloading.set(false);
      },
    });
  }
}