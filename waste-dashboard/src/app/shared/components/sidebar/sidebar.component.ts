import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface NavItem {
  label: string;
  route: string;
  available: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private auth = inject(AuthService);

  admin = this.auth.getAdmin();

  get initials(): string {
    if (!this.admin?.name) return 'A';
    return this.admin.name.split(' ')
      .slice(0, 2)
      .map((w: string) => w.charAt(0).toUpperCase())
      .join('');
  }

  logout(): void {
    this.auth.logout();
  }

  principalNav: NavItem[] = [
    { label: 'Resumen',       route: '/dashboard/resumen',  available: false },
    { label: 'Mapa de flota', route: '/dashboard/mapa',     available: false },
    { label: 'Análisis',      route: '/dashboard/analisis', available: false },
  ];

  gestionNav: NavItem[] = [
    { label: 'Usuarios',      route: '/dashboard/usuarios', available: true  },
    { label: 'Planificador',  route: '/dashboard/rutas',    available: false },
  ];

  adminNav: NavItem[] = [
    { label: 'Personal',      route: '/dashboard/personal', available: false },
  ];
}