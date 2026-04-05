
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../model/auth/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // api link
  private baseUrl = 'https://localhost:7275/api/Authentication';

  constructor(private http: HttpClient, private router: Router) {}

  // login
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(res => this.saveUser(res))
    );
  }

  // register
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap(res => this.saveUser(res))
    );
  }

  // save user data to localStorage
  private saveUser(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('name', res.name);
    localStorage.setItem('email', res.email);
  }

  // logout
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}