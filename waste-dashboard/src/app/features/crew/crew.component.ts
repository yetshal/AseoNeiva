import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-crew',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ pageTitle }}</h1>
          <p class="page-sub">Personal de campo de Ciudad Limpia</p>
        </div>
        <button class="btn-primary" (click)="openCreate()">+ Nuevo personal</button>
      </div>

      <!-- Stats -->
      <div class="crew-stats">
        <div class="stat-card">
          <span class="stat-value">{{ drivers.length }}</span>
          <span class="stat-label">Conductores</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ collectors.length }}</span>
          <span class="stat-label">Recolectores</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ sweepers.length }}</span>
          <span class="stat-label">Barredores</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="activeTab === 'drivers'" (click)="activeTab = 'drivers'">
          Conductores ({{ drivers.length }})
        </button>
        <button class="tab" [class.active]="activeTab === 'collectors'" (click)="activeTab = 'collectors'">
          Recolectores ({{ collectors.length }})
        </button>
        <button class="tab" [class.active]="activeTab === 'sweepers'" (click)="activeTab = 'sweepers'">
          Barredores ({{ sweepers.length }})
        </button>
      </div>

      <!-- List -->
      @if (loading) {
        <div class="loading">Cargando...</div>
      } @else {
        <div class="crew-list">
          @for (u of currentList; track u.id) {
            <div class="crew-card">
              <div class="crew-avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
              <div class="crew-info">
                <span class="crew-name">{{ u.name }}</span>
                <span class="crew-email">{{ u.email }}</span>
                <span class="crew-phone">{{ u.phone || 'Sin teléfono' }}</span>
              </div>
              <div class="crew-actions">
                <div class="crew-status" [class]="u.status">
                  {{ u.status === 'active' ? 'Activo' : 'Inactivo' }}
                </div>
                <button class="action-btn" (click)="editUser(u)">Editar</button>
              </div>
            </div>
          }
          @if (currentList.length === 0) {
            <div class="empty">No hay {{ activeTab }} registrados.</div>
          }
        </div>
      }

      <!-- Modal Create/Edit -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingId ? 'Editar' : 'Nuevo' }} {{ roleLabel }}</h2>
              <button class="close-btn" (click)="closeModal()">✕</button>
            </div>
            <div class="modal-body">
              @if (formError) {
                <div class="form-error">{{ formError }}</div>
              }
              <div class="form-group">
                <label>Nombre completo *</label>
                <input type="text" [(ngModel)]="form.name" class="form-input" placeholder="Nombre completo" />
              </div>
              <div class="form-group">
                <label>Correo electrónico *</label>
                <input type="email" [(ngModel)]="form.email" class="form-input" placeholder="correo@ciudadlimpia.com" />
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input type="text" [(ngModel)]="form.phone" class="form-input" placeholder="3001234567" />
              </div>
              <div class="form-group">
                <label>Tipo de personal</label>
                <select [(ngModel)]="form.user_type" class="form-input">
                  <option value="driver">Conductor</option>
                  <option value="collector">Recolector</option>
                  <option value="sweeper">Barredor</option>
                </select>
              </div>
              <div class="form-group">
                <label>Estado</label>
                <select [(ngModel)]="form.status" class="form-input">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
              <button class="btn-save" (click)="saveUser()">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 600; margin: 0 0 4px; }
    .page-sub { font-size: 14px; color: #666; margin: 0; }
    .btn-primary { background: #1D9E75; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .crew-stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #eee; min-width: 150px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; display: block; color: #1D9E75; }
    .stat-label { font-size: 13px; color: #666; }
    .tabs { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #eee; }
    .tab { padding: 12px 20px; border: none; background: none; cursor: pointer; font-size: 14px; color: #666; border-bottom: 2px solid transparent; }
    .tab.active { color: #1D9E75; border-bottom-color: #1D9E75; }
    .crew-list { display: flex; flex-direction: column; gap: 12px; }
    .crew-card { display: flex; align-items: center; gap: 16px; background: white; padding: 16px; border-radius: 12px; border: 1px solid #eee; }
    .crew-avatar { width: 48px; height: 48px; border-radius: 50%; background: #1D9E75; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; }
    .crew-info { flex: 1; }
    .crew-name { font-size: 15px; font-weight: 500; display: block; }
    .crew-email { font-size: 13px; color: #666; display: block; }
    .crew-phone { font-size: 12px; color: #999; }
    .crew-actions { display: flex; align-items: center; gap: 12px; }
    .crew-status { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .crew-status.active { background: #E1F5EE; color: #0F6E56; }
    .crew-status.inactive { background: #FEE2E2; color: #991B1B; }
    .action-btn { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer; font-size: 12px; }
    .action-btn:hover { background: #f5f5f5; }
    .loading, .empty { text-align: center; padding: 40px; color: #999; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 16px; width: 90%; max-width: 450px; }
    .modal-header { display: flex; justify-content: space-between; padding: 20px; border-bottom: 1px solid #eee; }
    .modal-header h2 { margin: 0; font-size: 18px; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; }
    .modal-body { padding: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; color: #666; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; border-top: 1px solid #eee; }
    .btn-cancel { padding: 10px 20px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; }
    .btn-save { padding: 10px 20px; border: none; border-radius: 8px; background: #1D9E75; color: white; cursor: pointer; }
    .form-error { background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
  `]
})
export class CrewComponent implements OnInit {
  private usersSvc = inject(UsersService);
  
  drivers: User[] = [];
  collectors: User[] = [];
  sweepers: User[] = [];
  loading = true;
  activeTab: 'drivers' | 'collectors' | 'sweepers' = 'drivers';

  showModal = false;
  editingId: string | null = null;
  saving = false;
  formError = '';
  form: any = { name: '', email: '', phone: '', user_type: 'driver', status: 'active' };

  get pageTitle(): string {
    return 'Personal de Campo';
  }

  get currentList(): User[] {
    switch (this.activeTab) {
      case 'drivers': return this.drivers;
      case 'collectors': return this.collectors;
      case 'sweepers': return this.sweepers;
    }
  }

  get roleLabel(): string {
    switch (this.activeTab) {
      case 'drivers': return 'Conductor';
      case 'collectors': return 'Recolector';
      case 'sweepers': return 'Barredor';
    }
  }

  ngOnInit() {
    this.loadCrew();
  }

  loadCrew() {
    this.loading = true;
    this.usersSvc.getUsers({ limit: 500 }).subscribe({
      next: res => {
        this.drivers = res.data.filter((u: User) => u.user_type === 'driver');
        this.collectors = res.data.filter((u: User) => u.user_type === 'collector');
        this.sweepers = res.data.filter((u: User) => u.user_type === 'sweeper');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openCreate() {
    this.editingId = null;
    this.form = { name: '', email: '', phone: '', user_type: this.activeTab, status: 'active' };
    this.formError = '';
    this.showModal = true;
  }

  editUser(user: User) {
    this.editingId = user.id;
    this.form = { ...user };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.formError = '';
  }

  saveUser() {
    if (!this.form.name || !this.form.email) {
      this.formError = 'Nombre y correo son obligatorios';
      return;
    }
    this.saving = true;
    this.formError = '';
    
    const payload = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone || null,
      user_type: this.form.user_type,
      status: this.form.status
    };

    if (this.editingId) {
      this.usersSvc.updateUser(this.editingId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadCrew();
        },
        error: (err) => {
          this.saving = false;
          this.formError = err.error?.message || 'Error al actualizar';
        }
      });
    } else {
      this.usersSvc.createUser(payload).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadCrew();
        },
        error: (err) => {
          this.saving = false;
          this.formError = err.error?.message || 'Error al crear';
        }
      });
    }
  }
}