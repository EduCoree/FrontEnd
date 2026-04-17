// src/app/pages/student/my-certificates/my-certificates.component.ts
// Branch: feature/student-progress-certificates-ui

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CertificateService } from '../../../core/services/certificate';
import { Certificate } from '../../../core/models/progress';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [CommonModule, RouterModule , TranslateModule],
  templateUrl: './my-certificates.component.html',
})
export class MyCertificatesComponent implements OnInit {

  // ─── State Signals ────────────────────────────────────────────────────────
  certificates = signal<Certificate[]>([]);
  isLoading    = signal(true);
  errorMsg     = signal('');

  constructor(private certificateService: CertificateService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  private loadCertificates(): void {
    this.isLoading.set(true);
    this.certificateService.getMyCertificates().subscribe({
      next: (data) => {
        this.certificates.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load your certificates. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  getDownloadUrl(uuid: string): string {
    return `${environment.apiUrl}/api/certificates/${uuid}/view`;
  }
}
