import { OtpPurpose } from './../../core/models/auth';
// src/app/pages/forgot-password/forgot-password.ts

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { TranslateModule } from '@ngx-translate/core';

type Step = 'email' | 'otp' | 'reset' | 'done';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink , TranslateModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private fb   = inject(FormBuilder);

  step     = signal<Step>('email');
  loading  = signal(false);
  errorMsg = signal('');
  showPass = signal(false);

  // Store email across steps
  private email = '';
  private resetToken='';

  emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(4)]],
  });

  resetForm: FormGroup = this.fb.group(
    {
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordsMatch }
  );

  // Step 1 — Send OTP
  sendOtp() {

    if (this.emailForm.invalid) return;
    
   
    this.loading.set(true);
    this.errorMsg.set('');
    this.email = this.emailForm.value.email;

    this.auth.sendOtp({email:this.email, purpose:'Password'}).subscribe({
      next: () => { this.step.set('otp'); this.loading.set(false); },
      error: (err) => { this.errorMsg.set(err.error.detail || "something went wrong, please try again"); this.loading.set(false); }
    });
  }

  // Step 2 — Verify OTP
  verifyOtp() {
    if (this.otpForm.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.verifyOtp({ email: this.email, otp: this.otpForm.value.otp,purpose:'Password' }).subscribe({
      next: (response) => {this.resetToken=response.resetToken!; this.step.set('reset'); this.loading.set(false); },
      error: () => { this.errorMsg.set('Invalid or expired OTP. Please try again.'); this.loading.set(false); },
    });
  }

  // Step 3 — Reset Password
  resetPassword() {
    if (this.resetForm.invalid) return;
    console.log('Email:', this.email);
    console.log('ResetToken:', this.resetToken);
    console.log('NewPassword:', this.resetForm.value.newPassword);
    console.log('ConfirmPassword:', this.resetForm.value.confirmPassword);
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.resetPassword({
      email:       this.email,
      resetToken:   this.resetToken,
      newPassword: this.resetForm.value.newPassword,
      confirmPassword:this.resetForm.value.ConfirmPassword
      
    }).subscribe({
      next: () => { this.step.set('done'); this.loading.set(false); },
      error: (err) => { this.errorMsg.set(err.error.errors?.InvalidToken?.[0]||'Invalid or Expired Token. Please try again.'); this.loading.set(false); },
    });
  }

  resendOtp() {
    this.loading.set(true);
    this.auth.sendOtp({email:this.email, purpose:'Password'}).subscribe({
      next: () => { this.loading.set(false); this.errorMsg.set(''); },
      error: () => { this.errorMsg.set('Failed to resend OTP.'); this.loading.set(false); },
    });
  }

  private passwordsMatch(group: FormGroup) {
    const p  = group.get('newPassword')?.value;
    const cp = group.get('confirmPassword')?.value;
    return p === cp ? null : { mismatch: true };
  }
}