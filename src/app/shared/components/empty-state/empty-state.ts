import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Friendly empty-state for tables and lists.
 *
 * Usage:
 *   <app-empty-state
 *     icon="fa-solid fa-receipt"
 *     title="No invoices yet"
 *     message="Your monthly invoices will appear here once generated."
 *   />
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center text-center py-12 px-6">
      <div class="w-16 h-16 mb-4 rounded-full bg-surface-container flex items-center justify-center">
        <i [class]="icon() + ' text-2xl text-on-surface-variant'"></i>
      </div>
      <h3 class="text-lg font-semibold text-on-surface mb-1">{{ title() }}</h3>
      @if (message()) {
        <p class="text-sm text-on-surface-variant max-w-sm">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input<string>('fa-solid fa-inbox');
  title = input.required<string>();
  message = input<string | null>(null);
}