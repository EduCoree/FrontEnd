// نماذج البيانات الخاصة بالـ Authentication

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  name: string;
  email: string;
  token: string;
}