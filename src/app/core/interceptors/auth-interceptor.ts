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

  // Don't attach token to auth endpoints (login, register, refresh-token)
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Attach token if available
  const token = auth.getToken();
  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.isLoggedIn()) {
        return handleRefresh(req, next, auth, router);
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
  // If already refreshing, queue this request until new token arrives
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

      // Retry the original request with the new token
      return next(addToken(req, user.token));
    }),
    catchError((err) => {
      // Refresh failed — session is dead, force logout
      isRefreshing = false;
      auth.clearUser();
      router.navigate(['/login']);
      return throwError(() => err);
    }),
  );
}
