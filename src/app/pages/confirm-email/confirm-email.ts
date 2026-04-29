// src/app/pages/confirm-email/confirm-email.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { TranslateModule } from '@ngx-translate/core';

type State = 'pending' | 'verifying' | 'success' | 'error';

@Component({
  selector: 'app-confirm-email',
  imports: [CommonModule, RouterLink , TranslateModule],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.css',
})
export class ConfirmEmailComponent implements OnInit {
  private auth  = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  state    = signal<State>('pending');
  loading  = signal(false);
  email    = signal('');
  errorMessage = signal('');

  // The email shown when waiting for confirmation (after register)
  // The userId+token are used when clicking the email link
  ngOnInit() {
      const email = this.route.snapshot.queryParamMap.get('email');
    const success = this.route.snapshot.queryParamMap.get('success');
    const errorMsg = this.route.snapshot.queryParamMap.get('errorMessage');

    if (email) this.email.set(email);

    // If userId and token are in URL → auto-confirm (user clicked email link)
      if (success === 'true') {
      this.state.set('success');
      return;
    }

    // Case 2: Backend redirect - Error
    if (success === 'false' && errorMsg) {
      this.state.set('error');
      this.errorMessage.set(decodeURIComponent(errorMsg));
      return;
    }
  }
  resend() {
    if (!this.email()) return;
    this.loading.set(true);
    this.auth.ResendConfirmation({email: this.email()}).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }
 
}