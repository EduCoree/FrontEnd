import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EarningStatus, InvoiceStatus } from '../../../core/models/payout.model';

import { TranslateModule } from '@ngx-translate/core';

type AnyStatus = InvoiceStatus | EarningStatus;

/**
 * A small colored pill badge for invoice/earning statuses.
 * Usage:
 *   <app-invoice-status-badge [status]="invoice.status" />
 */
@Component({
  selector: 'app-invoice-status-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      [class]="styleClasses()"
    >
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass()"></span>
      {{ 'earnings.status.' + status() | translate }}
    </span>
  `,
})
export class InvoiceStatusBadgeComponent {
  status = input.required<AnyStatus>();

  // Maps every possible status to its color theme.
  // Tailwind classes here use plain palette (gray, green, etc.) since the
  // brand palette is reserved for primary actions/headers — status badges
  // need clear universal colors.
  private styleMap: Record<AnyStatus, { container: string; dot: string; label: string }> = {
    // Invoice
    Draft:     { container: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',     dot: 'bg-gray-500',  label: 'Draft' },
    Issued:    { container: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',  dot: 'bg-amber-500', label: 'Awaiting Payment' },
    Paid:      { container: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200', dot: 'bg-emerald-500', label: 'Paid' },
    Cancelled: { container: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',     dot: 'bg-rose-500',  label: 'Cancelled' },

    // Earning-only
    Pending:   { container: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',     dot: 'bg-blue-500',  label: 'Pending' },
    Available: { container: 'bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200',     dot: 'bg-cyan-500',  label: 'Available' },
    Invoiced:  { container: 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200', dot: 'bg-indigo-500', label: 'Invoiced' },
  };

  styleClasses = computed(() => this.styleMap[this.status()]?.container ?? this.styleMap.Draft.container);
  dotClass     = computed(() => this.styleMap[this.status()]?.dot ?? this.styleMap.Draft.dot);
}