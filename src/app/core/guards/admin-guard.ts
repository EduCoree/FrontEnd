// src/app/core/guards/admin.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();

  if (!user) return router.createUrlTree(['/login']);

  // Decode role from JWT token
  const payload = JSON.parse(atob(user.token.split('.')[1]));
  const roles: string[] = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    ?? payload['role']
    ?? [];

  const isAdmin = Array.isArray(roles)
    ? roles.includes('Admin')
    : roles === 'Admin';

  if (isAdmin) return true;

  return router.createUrlTree(['/']);
};