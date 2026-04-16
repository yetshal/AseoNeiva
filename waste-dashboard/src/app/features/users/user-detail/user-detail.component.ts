import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { ReportsService } from '../../../core/services/reports.service';
import { UserDetail, Report, UserType } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private svc    = inject(UsersService);
  private reportsSvc = inject(ReportsService);

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

  userTypes: { value: UserType; label: string }[] = [
    { value: 'citizen',   label: 'Ciudadano' },
    { value: 'driver',   label: 'Conductor' },
    { value: 'collector', label: 'Recolector' },
  ];

  savingType = false;

  editMode = false;
  editName = '';
  editPhone = '';
  editAddress = '';
  savingUser = false;

  selectedReport: Report | null = null;
  reportStatuses = ['pending', 'rejected', 'resolved'];
  validating = false;
  alreadyValidated = false;

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

  changeUserType(newType: UserType): void {
    if (!this.user || this.user.user_type === newType) return;
    
    if (!confirm(`¿Cambiar el tipo de este usuario a "${this.userTypes.find(t => t.value === newType)?.label}"?`)) {
      return;
    }
    
    this.savingType = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.svc.updateUserType(this.user.id, newType).subscribe({
      next: () => {
        this.user!.user_type = newType;
        this.savingType = false;
        this.successMessage = 'Tipo de usuario actualizado correctamente.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.savingType = false;
        this.errorMessage = 'Error al actualizar el tipo de usuario.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
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
    return { pending: 'Pendiente', rejected: 'Inválido', resolved: 'Resuelto' }[status] ?? status;
  }

  startEdit(): void {
    if (!this.user) return;
    this.editName = this.user.name;
    this.editPhone = this.user.phone || '';
    this.editAddress = this.user.address || '';
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  saveUser(): void {
    if (!this.user || !this.editName.trim()) return;
    
    this.savingUser = true;
    this.svc.updateStatus(this.user.id, this.user.status).subscribe({
      next: () => {
        this.user!.name = this.editName.trim();
        this.user!.phone = this.editPhone.trim() || '';
        this.user!.address = this.editAddress.trim() || '';
        this.savingUser = false;
        this.editMode = false;
        this.successMessage = 'Usuario actualizado correctamente.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.savingUser = false;
        this.errorMessage = 'Error al actualizar usuario.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  openReport(report: Report): void {
    this.selectedReport = report;
    this.alreadyValidated = !!report.validation;
  }

  closeReport(): void {
    this.selectedReport = null;
    this.alreadyValidated = false;
  }

  updateReportStatus(newStatus: string): void {
    if (!this.selectedReport) return;
    
    this.reportsSvc.updateStatus(this.selectedReport.id, newStatus).subscribe({
      next: () => {
        const idx = this.reports.findIndex(r => r.id === this.selectedReport!.id);
        if (idx >= 0) {
          this.reports[idx] = { ...this.reports[idx], status: newStatus as any };
        }
        this.selectedReport = null;
        this.successMessage = 'Reporte actualizado correctamente.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.errorMessage = 'Error al actualizar reporte.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  validateReport(isValid: boolean): void {
    if (!this.selectedReport) return;
    
    const confirmed = confirm(isValid ? '¿Validar reporte y dar 5 puntos al usuario?' : '¿Marcar reporte como inválido?');
    console.log('Confirm result:', confirmed);
    
    if (!confirmed) {
      return;
    }
    
    this.validating = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const notes = isValid ? 'Reporte verificado' : 'Reporte no válido';
    console.log('Validating report:', this.selectedReport.id, isValid, notes);
    
    this.reportsSvc.validateReport(this.selectedReport.id, isValid, notes).subscribe({
      next: (res) => {
        console.log('Validation response:', res);
        this.validating = false;
        const idx = this.reports.findIndex(r => r.id === this.selectedReport!.id);
        if (idx >= 0) {
          const prevValidation = this.reports[idx].validation;
          const wasValid = prevValidation ? prevValidation.isValid : null;
          
          this.reports[idx] = { 
            ...this.reports[idx], 
            status: isValid ? 'resolved' as const : 'rejected' as const,
            validation: {
              isValid: isValid,
              notes: notes,
              validatedAt: new Date().toISOString(),
              validatedBy: ''
            }
          };
          
          // Adjust points in UI based on what changed
          if (this.user) {
            if (wasValid === true && !isValid) {
              // Was valid, now invalid - subtract 5
              this.user.points = Math.max(0, (this.user.points || 0) - 5);
              this.user.valid_reports = Math.max(0, (this.user.valid_reports || 0) - 1);
            } else if (wasValid === false && isValid) {
              // Was invalid, now valid - add 5
              this.user.points = (this.user.points || 0) + 5;
              this.user.valid_reports = (this.user.valid_reports || 0) + 1;
            } else if (wasValid === null && isValid) {
              // First validation as valid - add 5
              this.user.points = (this.user.points || 0) + 5;
              this.user.valid_reports = (this.user.valid_reports || 0) + 1;
            }
          }
        }
        this.successMessage = isValid 
          ? 'Reporte validado correctamente.'
          : 'Reporte marcado como inválido.';
        setTimeout(() => this.successMessage = '', 3000);
        this.selectedReport = null;
      },
      error: (err) => {
        console.error('Validation error:', err);
        this.validating = false;
        this.errorMessage = err.error?.message || 'Error al validar el reporte.';
        alert('Error: ' + (err.error?.message || 'Error al validar'));
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }
}