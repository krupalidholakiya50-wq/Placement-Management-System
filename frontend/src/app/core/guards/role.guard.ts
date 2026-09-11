import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const expectedRoles = route.data?.['roles'] as Array<string>;
  const currentUser = authService.currentUser();

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (currentUser && expectedRoles.includes(currentUser.role)) {
    return true;
  }

  notify.showError(`Access Denied: Your account role (${currentUser?.role || 'Guest'}) does not have permission to view this module.`);
  router.navigate(['/dashboard']);
  return false;
};
