import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Formats a numeric amount with thousand separators + currency suffix.
 * Provides a consistent visual treatment everywhere money is displayed.
 *
 * Examples:
 *   <app-money-display [amount]="1250" />               →  1,250.00 EGP
 *   <app-money-display [amount]="800" size="lg" />     →  larger text
 *   <app-money-display [amount]="-100" />              →  -100.00 EGP (red color)
 *   <app-money-display [amount]="500" [showCurrency]="false" />  →  500.00
 */
@Component({
  selector: 'app-money-display',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-baseline gap-1 font-medium tabular-nums" [class]="sizeClass()">
      <span [class]="amountColorClass()">{{ formattedAmount() }}</span>
      @if (showCurrency()) {
        <span class="text-on-surface-variant text-xs font-normal">{{ currency() }}</span>
      }
    </span>
  `,
})
export class MoneyDisplayComponent {
  amount = input.required<number>();
  currency = input<string>('EGP');
  showCurrency = input<boolean>(true);
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  /**
   * If true, negative amounts will be shown in red.
   * Default: true.
   */
  colorize = input<boolean>(true);

  formattedAmount = computed(() => {
    const value = this.amount() ?? 0;
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });

  sizeClass = computed(() => {
    switch (this.size()) {
      case 'sm':  return 'text-sm';
      case 'lg':  return 'text-xl';
      case 'xl':  return 'text-3xl font-bold';
      default:    return 'text-base';
    }
  });

  amountColorClass = computed(() => {
    if (!this.colorize()) return 'text-on-surface';
    return this.amount() < 0 ? 'text-rose-600' : 'text-on-surface';
  });
}