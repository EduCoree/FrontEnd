
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink , TranslateModule],
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

  notVerified  = signal(false);
pendingEmail = signal('');

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
    error: (err: HttpErrorResponse) => {
      if (err.status === 0) {
        this.errorMsg.set('Cannot reach the server. Please check your connection.');
      }
        else if(err.status===401 && err.error?.title==='Email.NotConfirmed')
        {
          this.pendingEmail.set(this.form.value.email);
          this.notVerified.set(true);  
         this.errorMsg.set('Please verify your email before logging in.');
      }
      else if (err.status === 401 || err.status === 400) {
        this.errorMsg.set('Invalid email or password.'); 
      }
    
       else if (err.status === 403) {
        this.errorMsg.set('Your account has been deactivated.');
      } else {
        this.errorMsg.set(err.error?.message || 'Something went wrong. Please try again.');
      }
      this.loading.set(false);
    },
  });
}
goToVerification() {
  this.router.navigate(['/confirm-email'], {
    queryParams: { email: this.pendingEmail() }
  });
}
backToLogin() {
  this.notVerified.set(false);
  this.pendingEmail.set('');
}

}