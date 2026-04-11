
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private auth    = inject(AuthService);
  private router  = inject(Router);
  private fb      = inject(FormBuilder);

  loading    = signal(false);
  errorMsg   = signal('');
  showPass   = signal(false);

  form: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

 submit() {
  if (this.form.invalid) return;
  this.loading.set(true);
  this.errorMsg.set('');

  this.auth.login(this.form.value).subscribe({
next: (user) => {
  this.auth.saveUser(user);

  if (this.auth.hasRole('Teacher')) {
    this.router.navigate(['/teacher/dashboard']);
  } else if (this.auth.hasRole('Student')) {
    this.router.navigate(['/student/dashboard']);
  } else if (this.auth.hasRole('Admin')) {
    this.router.navigate(['/admin/dashboard']);
  } else {
    this.router.navigate(['/']);
  }
},
    error: () => {
      this.errorMsg.set('Invalid email or password.');
      this.loading.set(false);
    },
  });
}
}