// src/app/pages/register/register.ts

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  loading  = signal(false);
  errorMsg = signal('');
  showPass = signal(false);

  form: FormGroup = this.fb.group(
    {
      name:            ['', [Validators.required, Validators.minLength(2)]],
      userName:        ['', [Validators.required, Validators.minLength(3)]],
      email:           ['', [Validators.required, Validators.email]],
      phoneNumber:     [''],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordsMatch }
  );

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const { confirmPassword, ...dto } = this.form.value;

    this.auth.register(dto).subscribe({
      next: (user) => {
        this.auth.saveUser(user);
        // Send confirmation email after register
        this.auth.sendConfirmation(user.email).subscribe();
        this.router.navigate(['/confirm-email'], { queryParams: { email: user.email } });
      },
      error: () => {
        this.errorMsg.set('Registration failed. Email or username may already be taken.');
        this.loading.set(false);
      },
    });
  }

  private passwordsMatch(group: FormGroup) {
    const p  = group.get('password')?.value;
    const cp = group.get('confirmPassword')?.value;
    return p === cp ? null : { mismatch: true };
  }
}