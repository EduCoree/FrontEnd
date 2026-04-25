import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

type KpiTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * Reusable KPI card used across both teacher and admin dashboards.
 *
 * Usage:
 *   <app-kpi-card
 *     label="Total Earned"
 *     value="28,500"
 *     suffix="EGP"
 *     icon="fa-solid fa-coins"
 *     tone="success"
 *     [trend]="{ value: 12.5, isPositive: true }"
 *   />
 */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative bg-surface-container-lowest rounded-2xl p-5 ring-1 ring-outline-variant/40 hover:shadow-md transition-shadow duration-200"
    >
      <!-- Header: label + icon -->
      <div class="flex items-start justify-between mb-3">
        <span class="text-sm font-medium text-on-surface-variant uppercase tracking-wide">
          {{ label() }}
        </span>
        @if (icon()) {
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center"
            [class]="iconBgClass()"
          >
            <i [class]="icon() + ' ' + iconColorClass()"></i>
          </div>
        }
      </div>

      <!-- Value -->
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-bold text-on-surface font-headline">
          {{ value() }}
        </span>
        @if (suffix()) {
          <span class="text-sm font-medium text-on-surface-variant">{{ suffix() }}</span>
        }
      </div>

      <!-- Subtitle / trend -->
      @if (subtitle() || trend()) {
        <div class="mt-3 flex items-center gap-2 text-sm">
          @if (trend(); as t) {
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              [class]="t.isPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'"
            >
              <i [class]="t.isPositive ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i>
              {{ t.value }}%
            </span>
          }
          @if (subtitle()) {
            <span class="text-on-surface-variant">{{ subtitle() }}</span>
          }
        </div>
      }
    </div>
  `,
})
export class KpiCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  suffix = input<string | null>(null);
  subtitle = input<string | null>(null);
  icon = input<string | null>(null);     // FontAwesome class, e.g. "fa-solid fa-coins"
  tone = input<KpiTone>('primary');
  trend = input<{ value: number; isPositive: boolean } | null>(null);

  private toneStyles: Record<KpiTone, { iconBg: string; iconColor: string }> = {
    primary:  { iconBg: 'bg-primary-fixed',     iconColor: 'text-on-primary-fixed' },
    success:  { iconBg: 'bg-emerald-100',       iconColor: 'text-emerald-700' },
    warning:  { iconBg: 'bg-amber-100',         iconColor: 'text-amber-700' },
    danger:   { iconBg: 'bg-rose-100',          iconColor: 'text-rose-700' },
    info:     { iconBg: 'bg-blue-100',          iconColor: 'text-blue-700' },
    neutral:  { iconBg: 'bg-surface-container', iconColor: 'text-on-surface-variant' },
  };

  iconBgClass    = () => this.toneStyles[this.tone()].iconBg;
  iconColorClass = () => this.toneStyles[this.tone()].iconColor;
}