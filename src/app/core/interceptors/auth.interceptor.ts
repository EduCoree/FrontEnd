import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor2: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();

  // Public endpoints token
  const publicUrls = ['/api/auth'];
  const isPublic = publicUrls.some(url => req.url.includes(url));
  if (isPublic) return next(req);

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};