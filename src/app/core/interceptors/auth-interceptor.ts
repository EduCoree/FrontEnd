import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = auth.getToken();
  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 → try refresh token (must be first, must return)
      if (error.status === 401 && auth.isLoggedIn()) {
        return handleRefresh(req, next, auth, router);
      }

      // 403 → error page
      if (error.status === 403) {
        router.navigate(['/error/403']);
      }

      // 500 → error page (only for real 500s, not refresh issues)
      if (error.status === 500) {
        router.navigate(['/error/500']);
      }

      // 0 → connection refused
      if (error.status === 0) {
        router.navigate(['/error/500']);
      }

      return throwError(() => error);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/authentication/login')
      || url.includes('/authentication/register')
      || url.includes('/authentication/refresh-token');
}

function handleRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router,
) {
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addToken(req, token!))),
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  const refreshToken = auth.getRefreshToken();
  if (!refreshToken) {
    isRefreshing = false;
    auth.clearUser();
    router.navigate(['/login']);
    return throwError(() => new Error('No refresh token'));
  }

  return auth.refreshToken({ refreshToken }).pipe(
    switchMap((user) => {
      isRefreshing = false;
      auth.saveUser(user);
      refreshTokenSubject.next(user.token);
      return next(addToken(req, user.token));
    }),
    catchError((err) => {
      isRefreshing = false;
      auth.clearUser();
      router.navigate(['/login']);
      return throwError(() => err);
    }),
  );
}