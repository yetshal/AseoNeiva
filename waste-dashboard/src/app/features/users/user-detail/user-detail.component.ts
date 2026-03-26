import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { UserDetail, Report } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private svc    = inject(UsersService);

  user: UserDetail | null = null;
  reports: Report[]       = [];
  loading                 = true;
  savingStatus            = false;
  showStatusMenu          = false;
  successMessage          = '';
  errorMessage            = '';

  readonly statuses: { value: 'active' | 'inactive' | 'pending'; label: string; class: string }[] = [
    { value: 'active',   label: 'Activo',    class: 'active'   },
    { value: 'inactive', label: 'Inactivo',  class: 'inactive' },
    { value: 'pending',  label: 'Pendiente', class: 'pending'  },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getUserById(id).subscribe({
      next: res => {
        this.user    = res.user;
        this.reports = res.reports;
        this.loading = false;
      },
      error: () => this.router.navigate(['/dashboard/usuarios'])
    });
  }

  toggleStatusMenu(): void {
    this.showStatusMenu = !this.showStatusMenu;
  }

  changeStatus(status: 'active' | 'inactive' | 'pending'): void {
    if (!this.user || this.user.status === status) {
      this.showStatusMenu = false;
      return;
    }

    this.savingStatus   = true;
    this.showStatusMenu = false;
    this.successMessage = '';
    this.errorMessage   = '';

    this.svc.updateStatus(this.user.id, status).subscribe({
      next: res => {
        this.user!.status = res.user.status;
        this.savingStatus  = false;
        this.successMessage = 'Estado actualizado correctamente.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.savingStatus = false;
        this.errorMessage = 'Error al actualizar el estado.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  suspend(): void {
    if (!this.user || this.user.status === 'inactive') return;
    this.changeStatus('inactive');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/usuarios']);
  }

  getLevelTitle(level: number): string {
    const titles: Record<number, string> = {
      1: 'Ciudadano', 2: 'Colaborador', 3: 'Guardián',
      4: 'Embajador', 5: 'Héroe Ambiental'
    };
    return titles[level] ?? 'Héroe Ambiental';
  }

  getPointsToNextLevel(points: number, level: number): number {
    const thresholds = [0, 100, 300, 600, 1000, 2000];
    return Math.max(0, (thresholds[level] ?? 2000) - points);
  }

  getProgressPercent(points: number, level: number): number {
    const thresholds = [0, 100, 300, 600, 1000, 2000];
    const from = thresholds[level - 1] ?? 0;
    const to   = thresholds[level]     ?? 2000;
    return Math.min(100, Math.round(((points - from) / (to - from)) * 100));
  }

  getStatusLabel(status: string): string {
    return { active: 'Activo', inactive: 'Inactivo', pending: 'Pendiente' }[status] ?? status;
  }

  getReportStatusLabel(status: string): string {
    return { pending: 'Pendiente', reviewing: 'En revisión', resolved: 'Resuelto' }[status] ?? status;
  }
}