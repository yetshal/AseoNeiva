import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/users/users-list/users-list.component')
            .then(m => m.UsersListComponent)
      },
      {
        path: 'usuarios/:id',
        loadComponent: () =>
          import('./features/users/user-detail/user-detail.component')
            .then(m => m.UserDetailComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];