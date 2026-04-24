import { SendOtpDto, VerifyOtpResponseDto} from './../models/auth';
// src/app/core/services/auth.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginDto, RegisterDto, UserDto,
  RefreshTokenDto, VerifyOtpDto,
  ResetPasswordDto, EmailConfirmationDto, OtpPurpose,
  ResendEmailDto
} from '../models/auth';
import { NotificationService } from './notification.service';
import { json } from 'stream/consumers';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private notificationservice=inject(NotificationService)
  private base   = `${environment.apiUrl}/api/authentication`;

  currentUser = signal<UserDto | null>(this.loadUser());
  constructor()
  {
    const user = this.currentUser();
    if(user?.token)
    {
      this.notificationservice.startConnection(user.token);   // handling refresh the page as save user is called at register or login
    }
  }

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
  ResendConfirmation(dto:ResendEmailDto) {
    return this.http.post<string>(`${this.base}/resend-confirmation`,dto)
  }

  // ── OTP / Password Reset ──────────────────────────────────────────────────
  sendOtp(dto:SendOtpDto) {
    return this.http.post<boolean>(`${this.base}/send-otp`,dto);
  }

  verifyOtp(dto:VerifyOtpDto) {

    return this.http.post<VerifyOtpResponseDto>(`${this.base}/verify-otp`, dto);
  }

  resetPassword(dto: ResetPasswordDto) {
    return this.http.post<boolean>(`${this.base}/reset-password`, dto);
  }

  // ── Session Helpers ───────────────────────────────────────────────────────
  saveUser(user: UserDto) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.notificationservice.startConnection(user.token);
  }

  clearUser() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.notificationservice.stopConnection();
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