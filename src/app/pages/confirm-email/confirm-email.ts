// src/app/pages/confirm-email/confirm-email.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  state    = signal<State>('pending');
  loading  = signal(false);
  email    = signal('');

  // The email shown when waiting for confirmation (after register)
  // The userId+token are used when clicking the email link
  ngOnInit() {
    const email   = this.route.snapshot.queryParamMap.get('email');
    const userId  = this.route.snapshot.queryParamMap.get('userId');
    const token   = this.route.snapshot.queryParamMap.get('token');

    if (email) this.email.set(email);

    // If userId and token are in URL → auto-confirm (user clicked email link)
    if (userId && token) {
      this.state.set('verifying');
      this.auth.confirmEmail({ userId, token }).subscribe({
        next: () => this.state.set('success'),
        error: () => this.state.set('error'),
      });
    }
  }

  resend() {
    if (!this.email()) return;
    this.loading.set(true);
    this.auth.sendConfirmation(this.email()).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }
}