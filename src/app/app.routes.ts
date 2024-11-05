import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { sessionGuard } from './guards/session.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  {
    path: 'session-login',
    loadComponent: () => import('./components/auth/session-login/session-login.component')
      .then(m => m.SessionLoginComponent),
    canActivate: [sessionGuard]
  },
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./components/auth/register/register.component')
          .then(m => m.RegisterComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        canActivate: [authGuard]
      },
      {
        path: 'services',
        loadComponent: () => import('./components/services/services.component')
          .then(m => m.ServicesComponent),
        canActivate: [authGuard]
      },
      {
        path: 'transactions',
        loadComponent: () => import('./components/transactions/transactions.component')
          .then(m => m.TransactionsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard]
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  }
];
