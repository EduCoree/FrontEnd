// src/app/pages/public/certificate-detail/certificate-detail.component.ts
// Branch: feature/public-certificate-page

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CertificateService } from '../../../core/services/certificate';
import { Certificate } from '../../../core/models/progress';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-certificate-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-detail.component.html',
})
export class CertificateDetailComponent implements OnInit {

  // ─── State Signals ────────────────────────────────────────────────────────
  certificate = signal<Certificate | null>(null);
  isLoading   = signal(true);
  errorMsg    = signal('');

  constructor(
    private route: ActivatedRoute,
    private certificateService: CertificateService
  ) {}

  ngOnInit(): void {
    const certificateId = this.route.snapshot.paramMap.get('certificateId');
    if (!certificateId) {
      this.errorMsg.set('Invalid certificate link.');
      this.isLoading.set(false);
      return;
    }
    
    this.loadCertificate(certificateId);
  }

  private loadCertificate(id: string): void {
    this.isLoading.set(true);
    this.certificateService.getCertificate(id).subscribe({
      next: (cert) => {
        if (!cert) {
          this.errorMsg.set('Certificate not found or invalid link.');
        } else {
          this.certificate.set(cert);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Certificate not found or invalid link.');
        this.isLoading.set(false);
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  
  getDownloadUrl(): string {
    const cert = this.certificate();
    if (!cert) return '#';
    return `${environment.apiUrl}/api/certificates/${cert.certificateUuid}/view`;
  }

  get encodedLinkedinShareUrl(): string {
    const cert = this.certificate();
    if (!cert) return '#';
    // Share the actual frontend URL so viewers see this beautiful public page
    const frontendUrl = window.location.href;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(frontendUrl)}`;
  }
}
