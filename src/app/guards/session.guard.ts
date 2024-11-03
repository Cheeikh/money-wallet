import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const sessionGuard = () => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.isSessionValid()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
}; 