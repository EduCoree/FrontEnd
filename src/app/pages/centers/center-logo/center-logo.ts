
import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CenterService } from '../../../core/services/center.service';

@Component({
  selector: 'app-center-logo',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './center-logo.html',
  styleUrl: './center-logo.css',
})
export class CenterLogo {
private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private centerService = inject(CenterService);
  private platformId = inject(PLATFORM_ID);

  centerId = signal<number>(0);
  currentLogoUrl = signal<string>('');
  previewUrl = signal<string>('');
  saving = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    logoUrl: ['', [Validators.required, Validators.pattern('https?://.+')]]
  });

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.centerId.set(id);

    this.centerService.getById(id).subscribe({
      next: (center) => {
        const logo = center.logoUrl ?? '';
        this.currentLogoUrl.set(logo);
        this.previewUrl.set(logo);
        this.form.patchValue({ logoUrl: logo });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load center data.');
        this.loading.set(false);
      }
    });

    // ✅ live preview لما يكتب URL
    this.form.get('logoUrl')?.valueChanges.subscribe(val => {
      this.previewUrl.set(val);
    });
  }

  onImageError() {
    this.previewUrl.set('');
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const logoUrl = this.form.value.logoUrl;

    this.centerService.updateLogo(this.centerId(), logoUrl).subscribe({
      next: () => {
        this.currentLogoUrl.set(logoUrl);
        this.successMsg.set('Logo updated successfully!');
        this.saving.set(false);
        setTimeout(() => {
          this.router.navigate(['/centers', this.centerId()]);
        }, 1200);
      },
      error: () => {
        this.error.set('Failed to update logo. Please try again.');
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/centers', this.centerId()]);
  }
}
