import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PayoutSettingsService } from '../../../core/services/payout-settings';
import {
  PayoutSettingsDto,
  UpdatePayoutSettingsDto,
} from '../../../core/models/payout.model';

import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton';
import { MoneyDisplayComponent } from '../../../shared/components/money-display/money-display';
import { TranslateModule } from '@ngx-translate/core';
import { AdminSidebarComponent } from "../../../layouts/admin-sidebar/admin-sidebar";

@Component({
  selector: 'app-admin-payout-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LoadingSkeletonComponent,
    MoneyDisplayComponent,
    TranslateModule,
    AdminSidebarComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-payout-settings.html',
})
export class AdminPayoutSettingsComponent implements OnInit {
  private settingsService = inject(PayoutSettingsService);

  // ── State ────────────────────────────────────────────────────────
  loading = signal(true);
  saving = signal(false);
  loadError = signal<string | null>(null);
  saveError = signal<string | null>(null);
  saveSuccess = signal(false);

  /** The current persisted settings (used to display lastUpdated info) */
  current = signal<PayoutSettingsDto | null>(null);

  /**
   * Form fields (using a single object signal lets us reset easily).
   * The commission rate is shown as a percentage (0-100) for the user,
   * but stored/sent as a decimal (0-1).
   */
  form = signal<UpdatePayoutSettingsDto>({
    teacherCommissionRate: 0.80,
    tier1Threshold: 10,
    tier1Bonus: 500,
    tier2Threshold: 30,
    tier2Bonus: 1500,
    tier3Threshold: 50,
    tier3Bonus: 3000,
    currency: 'EGP',
  });

  /** Helper: bind percent input (0-100) to the decimal commission rate */
  get commissionPercent(): number {
    return Math.round(this.form().teacherCommissionRate * 100);
  }
  set commissionPercent(value: number) {
    const decimal = Math.max(0, Math.min(100, value)) / 100;
    this.updateField('teacherCommissionRate', decimal);
  }

  // ── Lifecycle ────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.current.set(data);
        // Sync form with loaded settings (drop fields that aren't in the update DTO)
        this.form.set({
          teacherCommissionRate: data.teacherCommissionRate,
          tier1Threshold: data.tier1Threshold,
          tier1Bonus: data.tier1Bonus,
          tier2Threshold: data.tier2Threshold,
          tier2Bonus: data.tier2Bonus,
          tier3Threshold: data.tier3Threshold,
          tier3Bonus: data.tier3Bonus,
          currency: data.currency,
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load settings', err);
        this.loadError.set('Could not load current settings.');
        this.loading.set(false);
      },
    });
  }

  // ── Form helpers ──────────────────────────────────────────────────

  updateField<K extends keyof UpdatePayoutSettingsDto>(key: K, value: UpdatePayoutSettingsDto[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
    this.saveSuccess.set(false); // any change clears the "saved" state
  }

  updateTierField(tierNum: number, field: 'Threshold' | 'Bonus', value: number): void {
    const key = `tier${tierNum}${field}` as keyof UpdatePayoutSettingsDto;
    this.updateField(key, value);
  }

  /**
   * Validation that mirrors the backend's checks:
   * - thresholds must be strictly increasing
   * - bonuses must be monotonically non-decreasing
   * - commission rate 0-100%
   */
  validationErrors = (): string[] => {
    const f = this.form();
    const errors: string[] = [];

    if (f.teacherCommissionRate < 0 || f.teacherCommissionRate > 1) {
      errors.push('Commission rate must be between 0% and 100%.');
    }
    if (f.tier2Threshold <= f.tier1Threshold) {
      errors.push('Tier 2 threshold must be greater than Tier 1.');
    }
    if (f.tier3Threshold <= f.tier2Threshold) {
      errors.push('Tier 3 threshold must be greater than Tier 2.');
    }
    if (f.tier2Bonus < f.tier1Bonus) {
      errors.push('Tier 2 bonus should be ≥ Tier 1 bonus.');
    }
    if (f.tier3Bonus < f.tier2Bonus) {
      errors.push('Tier 3 bonus should be ≥ Tier 2 bonus.');
    }
    return errors;
  };

  isValid = (): boolean => this.validationErrors().length === 0;

  // ── Submit ────────────────────────────────────────────────────────

  save(): void {
    if (!this.isValid() || this.saving()) return;

    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    this.settingsService.updateSettings(this.form()).subscribe({
      next: (updated) => {
        this.current.set(updated);
        this.saving.set(false);
        this.saveSuccess.set(true);
        // Auto-dismiss the success banner after a few seconds
        setTimeout(() => this.saveSuccess.set(false), 4000);
      },
      error: (err) => {
        console.error('Save failed', err);
        this.saveError.set(err?.error?.detail || err?.error?.message || 'Could not save settings.');
        this.saving.set(false);
      },
    });
  }

  /** Resets the form to the currently persisted values */
  reset(): void {
    const data = this.current();
    if (!data) return;
    this.form.set({
      teacherCommissionRate: data.teacherCommissionRate,
      tier1Threshold: data.tier1Threshold,
      tier1Bonus: data.tier1Bonus,
      tier2Threshold: data.tier2Threshold,
      tier2Bonus: data.tier2Bonus,
      tier3Threshold: data.tier3Threshold,
      tier3Bonus: data.tier3Bonus,
      currency: data.currency,
    });
    this.saveError.set(null);
    this.saveSuccess.set(false);
  }
}