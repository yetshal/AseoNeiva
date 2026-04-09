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
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },

      // Resumen
      {
        path: 'resumen',
        loadComponent: () =>
          import('./features/summary/summary.component').then(m => m.SummaryComponent)
      },

      // Mapa de flota
      {
        path: 'mapa',
        loadComponent: () =>
          import('./features/fleet/fleet-map.component').then(m => m.FleetMapComponent)
      },

      // Análisis
      {
        path: 'analisis',
        loadComponent: () =>
          import('./features/analysis/analysis.component').then(m => m.AnalysisComponent)
      },

      // Usuarios (ciudadanos)
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'usuarios/:id',
        loadComponent: () =>
          import('./features/users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },

      // Planificador de rutas
      {
        path: 'rutas',
        loadComponent: () =>
          import('./features/route-planner/route-planner.component').then(m => m.RoutePlannerComponent)
      },

      // Personal (admins del dashboard)
      {
        path: 'personal',
        loadComponent: () =>
          import('./features/staff/staff.component').then(m => m.StaffComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
