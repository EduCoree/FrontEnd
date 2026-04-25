import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton placeholder for loading states.
 * Shows a pulsing gray block matching the dimensions of the eventual content.
 *
 * Usage:
 *   <app-loading-skeleton variant="card" />
 *   <app-loading-skeleton variant="text" [count]="3" />
 *   <app-loading-skeleton variant="row" [count]="5" />
 */
@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (variant()) {
      @case ('card') {
        <div class="bg-surface-container-lowest rounded-2xl p-5 ring-1 ring-outline-variant/40">
          <div class="flex items-start justify-between mb-3">
            <div class="h-3 w-24 bg-surface-container animate-pulse rounded"></div>
            <div class="w-10 h-10 bg-surface-container animate-pulse rounded-xl"></div>
          </div>
          <div class="h-8 w-32 bg-surface-container animate-pulse rounded mb-2"></div>
          <div class="h-3 w-20 bg-surface-container animate-pulse rounded"></div>
        </div>
      }

      @case ('text') {
        @for (_ of skeletonArray(); track $index) {
          <div class="h-3 bg-surface-container animate-pulse rounded mb-2 last:mb-0"
               [style.width.%]="100 - ($index * 10)"></div>
        }
      }

      @case ('row') {
        <div class="space-y-3">
          @for (_ of skeletonArray(); track $index) {
            <div class="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl">
              <div class="w-10 h-10 bg-surface-container animate-pulse rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 w-3/4 bg-surface-container animate-pulse rounded"></div>
                <div class="h-3 w-1/2 bg-surface-container animate-pulse rounded"></div>
              </div>
              <div class="h-6 w-20 bg-surface-container animate-pulse rounded-full"></div>
            </div>
          }
        </div>
      }

      @case ('chart') {
        <div class="bg-surface-container-lowest rounded-2xl p-5 ring-1 ring-outline-variant/40">
          <div class="h-4 w-40 bg-surface-container animate-pulse rounded mb-6"></div>
          <div class="h-64 bg-surface-container animate-pulse rounded-xl"></div>
        </div>
      }
    }
  `,
})
export class LoadingSkeletonComponent {
  variant = input<'card' | 'text' | 'row' | 'chart'>('card');
  count = input<number>(3);

  skeletonArray = () => Array.from({ length: this.count() }, (_, i) => i);
}