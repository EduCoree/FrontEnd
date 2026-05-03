
import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CenterService } from '../../../../core/services/center.service';
import { Categories } from "../../categories/categories";
import { Sidebar } from "../../../../shared/components/ui/sidebar/sidebar";
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-center-edit',
  imports: [CommonModule, ReactiveFormsModule, Categories, Sidebar , TranslateModule],
  templateUrl: './center-edit.html',
  styleUrl: './center-edit.css',
})
export class CenterEdit implements OnInit{

 private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private centerService = inject(CenterService);
  private platformId = inject(PLATFORM_ID);  

  centerId = signal<number>(0);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name:         ['', [Validators.required, Validators.maxLength(120)]],
    logoUrl:      [''],
    contactEmail: ['', [Validators.required, Validators.email]],
    phone:        ['', Validators.maxLength(20)],
    address:      [''],
    socialLinks: this.fb.group({
      facebook:  [''],
      twitter:   [''],
      instagram: [''],
      linkedIn:  [''],
      youTube:   [''],
      website:   ['']
    })
  });

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.centerId.set(id);
        this.loadCenter(id);
      }
    });
  }

  loadCenter(id: number) {
    this.loading.set(true);
    this.error.set(null);
    this.centerService.getById(id).subscribe({
      next: (center) => {
        this.form.patchValue({
          name:         center.name,
          logoUrl:      center.logoUrl ?? '',
          contactEmail: center.contactEmail,
          phone:        center.phone ?? '',
          address:      center.address ?? '',
          socialLinks: {
            facebook:  center.socialLinks?.facebook  ?? '',
            twitter:   center.socialLinks?.twitter   ?? '',
            instagram: center.socialLinks?.instagram ?? '',
            linkedIn:  center.socialLinks?.linkedIn  ?? '',
            youTube:   center.socialLinks?.youTube   ?? '',
            website:   center.socialLinks?.website   ?? ''
          }
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load center data.');
        this.loading.set(false);
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);

    this.centerService.update(this.centerId(), this.form.value).subscribe({
      next: () => {
        this.successMsg.set('Center updated successfully!');
        this.saving.set(false);
        setTimeout(() => {
          this.router.navigate(['/centers', this.centerId()]);
        }, 1200);
      },
      error: () => {
        this.error.set('Failed to save changes. Please try again.');
        this.saving.set(false);
      }
    });
  }

  discard() {
    this.router.navigate(['/centers', this.centerId()]);
  }

  isInvalid(field: string) {
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }
}


