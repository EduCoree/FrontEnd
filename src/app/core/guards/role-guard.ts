import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard = (allowedRole: string): CanActivateFn => {
  return (_route, _state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);

    if (auth.hasRole(allowedRole)) return true;

    if (auth.hasRole('Teacher')) return router.createUrlTree(['/teacher/dashboard']);
    if (auth.hasRole('Student')) return router.createUrlTree(['/student/dashboard']);
    if (auth.hasRole('Admin')) return router.createUrlTree(['/admin']);

    return router.createUrlTree(['/']);
  };
};