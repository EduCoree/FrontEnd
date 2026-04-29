import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminPayoutService } from '../../../core/services/admin-payout';
import { GenerateInvoicesResultDto } from '../../../core/models/payout.model';

import { MoneyDisplayComponent } from '../../../shared/components/money-display/money-display';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-generate-invoices',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MoneyDisplayComponent,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-generate-invoices.html',
})
export class AdminGenerateInvoicesComponent {
  private adminService = inject(AdminPayoutService);

  // ── State ────────────────────────────────────────────────────────
  generating = signal(false);
  result = signal<GenerateInvoicesResultDto | null>(null);
  error = signal<string | null>(null);

  // Default to *previous* month (matches the auto-job's behavior)
  year = signal<number>(new Date().getMonth() === 0
    ? new Date().getFullYear() - 1   // January → previous year's December
    : new Date().getFullYear());
  month = signal<number>(new Date().getMonth() === 0 ? 12 : new Date().getMonth());

  // ── Year/month dropdown options ──────────────────────────────────

  /** Year options: current year ± 2 */
  yearOptions = (() => {
    const current = new Date().getFullYear();
    return [current - 2, current - 1, current, current + 1];
  })();

  monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // ── Generate ──────────────────────────────────────────────────────

  generate(): void {
    if (this.generating()) return;

    this.generating.set(true);
    this.result.set(null);
    this.error.set(null);

    this.adminService.generateInvoices(this.year(), this.month()).subscribe({
      next: (data) => {
        this.result.set(data);
        this.generating.set(false);
      },
      error: (err) => {
        console.error('Generate failed', err);
        this.error.set(err?.error?.detail || err?.error?.message || 'Could not generate invoices.');
        this.generating.set(false);
      },
    });
  }

  /** Reset for a new run */
  reset(): void {
    this.result.set(null);
    this.error.set(null);
  }
}