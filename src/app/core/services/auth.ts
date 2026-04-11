// src/app/core/services/auth.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginDto, RegisterDto, UserDto,
  RefreshTokenDto, VerifyOtpDto,
  ResetPasswordDto, EmailConfirmationDto, OtpPurpose
} from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private base   = `${environment.apiUrl}/api/authentication`;

  currentUser = signal<UserDto | null>(this.loadUser());

  // ── Auth ──────────────────────────────────────────────────────────────────
  login(dto: LoginDto) {
    return this.http.post<UserDto>(`${this.base}/login`, dto);
  }

  register(dto: RegisterDto) {
    return this.http.post<UserDto>(`${this.base}/register`, dto);
  }

  refreshToken(dto: RefreshTokenDto) {
    return this.http.post<UserDto>(`${this.base}/refresh-token`, dto);
  }

  logout(refreshToken: string) {
    return this.http.post<boolean>(`${this.base}/logout`, { refreshToken });
  }

  checkEmail(email: string) {
    return this.http.get<boolean>(`${this.base}/emailExists`, { params: { email } });
  }

  // ── Email Confirmation ────────────────────────────────────────────────────
  sendConfirmation(email: string) {
    return this.http.post<string>(`${this.base}/send-confirmation`, JSON.stringify(email), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  confirmEmail(dto: EmailConfirmationDto) {
    const params = new HttpParams().set('userId', dto.userId).set('token', dto.token);
    return this.http.get<string>(`${this.base}/confirm-email`, { params });
  }

  // ── OTP / Password Reset ──────────────────────────────────────────────────
  sendOtp(email: string, purpose: OtpPurpose) {
    const params = new HttpParams().set('email', email).set('purpose', purpose);
    return this.http.post<boolean>(`${this.base}/send-otp`, {}, { params });
  }

  verifyOtp(dto: VerifyOtpDto, purpose: OtpPurpose) {
    const params = new HttpParams().set('purpose', purpose);
    return this.http.post<boolean>(`${this.base}/verify-otp`, dto, { params });
  }

  resetPassword(dto: ResetPasswordDto) {
    return this.http.post<boolean>(`${this.base}/reset-password`, dto);
  }

  // ── Session Helpers ───────────────────────────────────────────────────────
  saveUser(user: UserDto) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  clearUser() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  getRefreshToken(): string | null {
    return this.currentUser()?.refreshToken ?? null;
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  private loadUser(): UserDto | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
  // exract role from token
 getRoleFromToken(): string | string[] | null {
  const token = this.getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? null;
  } catch {
    return null;
  }
}

hasRole(role: string): boolean {
  const roles = this.getRoleFromToken();
  if (!roles) return false;
  if (Array.isArray(roles)) return roles.includes(role);
  return roles === role;
}
}