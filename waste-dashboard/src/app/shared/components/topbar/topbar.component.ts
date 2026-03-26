import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  private router = inject(Router);

  breadcrumbs: string[] = ['Dashboard'];

  private routeLabels: Record<string, string> = {
    'usuarios':    'Usuarios',
    'resumen':     'Resumen',
    'mapa':        'Mapa de flota',
    'analisis':    'Análisis',
    'rutas':       'Planificador',
    'personal':    'Personal',
  };

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects)
    ).subscribe(url => this.buildBreadcrumbs(url));

    // Ejecutar al iniciar
    this.buildBreadcrumbs(this.router.url);
  }

  private buildBreadcrumbs(url: string): void {
    const segments = url.split('/').filter(Boolean);
    // segments = ['dashboard', 'usuarios'] o ['dashboard', 'usuarios', ':id']
    this.breadcrumbs = ['Dashboard'];

    if (segments[1]) {
      const label = this.routeLabels[segments[1]];
      if (label) this.breadcrumbs.push(label);
    }

    if (segments[2]) {
      // Estamos en el detalle de un usuario
      this.breadcrumbs.push('Detalle');
    }
  }
}