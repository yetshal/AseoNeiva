import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginPage } from './pages/auth/login.page';
import { RegisterPage } from './pages/auth/register.page';
import { RecoveryPage } from './pages/auth/recovery.page';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  // Auth pages (no tabs)
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'recovery', component: RecoveryPage },

  // Tabs (protected)
  {
    path: 'tabs',
    canActivate: [AuthGuard],
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },

  // Default redirect
  { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/tabs/home' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
