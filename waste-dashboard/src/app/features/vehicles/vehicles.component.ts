import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FleetService } from '../../core/services/fleet.service';
import { UsersService } from '../../core/services/users.service';
import { Vehicle } from '../../shared/models/fleet.model';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Vehículos</h1>
          <p class="page-sub">Gestión de flota vehicular</p>
        </div>
        <button class="btn-primary" (click)="openCreate()">+ Nuevo vehículo</button>
      </div>

      <!-- Stats -->
      <div class="vehicle-stats">
        <div class="stat-card">
          <span class="stat-value">{{ vehicles.length }}</span>
          <span class="stat-label">Total vehículos</span>
        </div>
        <div class="stat-card active">
          <span class="stat-value">{{ activeCount }}</span>
          <span class="stat-label">Activos</span>
        </div>
        <div class="stat-card maintenance">
          <span class="stat-value">{{ maintenanceCount }}</span>
          <span class="stat-label">Mantenimiento</span>
        </div>
        <div class="stat-card out-of-service">
          <span class="stat-value">{{ offCount }}</span>
          <span class="stat-label">Fuera de servicio</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input type="text" class="search-input" placeholder="Buscar por placa..." [(ngModel)]="searchTerm" (ngModelChange)="loadVehicles()" />
        <select class="filter-select" [(ngModel)]="statusFilter" (change)="loadVehicles()">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="maintenance">Mantenimiento</option>
          <option value="out_of_service">Fuera de servicio</option>
        </select>
      </div>

      <!-- List -->
      @if (loading) {
        <div class="loading">Cargando...</div>
      } @else if (vehicles.length === 0) {
        <div class="empty">No hay vehículos registrados.</div>
      } @else {
        <div class="vehicle-grid">
          @for (v of vehicles; track v.id) {
            <div class="vehicle-card">
              <div class="vehicle-card-content" (click)="selectVehicle(v)">
                <div class="vehicle-icon">🚛</div>
                <div class="vehicle-info">
                  <span class="vehicle-plate">{{ v.plate }}</span>
                  <span class="vehicle-type">{{ getTypeLabel(v.type) }}</span>
                  <span class="vehicle-model">{{ v.model || 'Sin modelo' }}</span>
                  @if (v.driver_name) {
                    <span class="vehicle-driver">Conductor: {{ v.driver_name }}</span>
                  }
                </div>
                <div class="vehicle-status" [class]="v.status">
                  {{ getStatusLabel(v.status) }}
                </div>
              </div>
              <button class="delete-btn" (click)="confirmDelete(v.id, $event)">🗑️</button>
            </div>
          }
        </div>
      }

      <!-- Delete Confirmation -->
      @if (deleteId) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-content confirm-modal" (click)="$event.stopPropagation()">
            <h3>¿Eliminar vehículo?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="cancelDelete()">Cancelar</button>
              <button class="btn-delete" (click)="doDelete()" [disabled]="deleting">
                {{ deleting ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create/Edit Modal -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingId ? 'Editar' : 'Nuevo' }} vehículo</h2>
              <button class="close-btn" (click)="closeModal()">✕</button>
            </div>
            <div class="modal-body">
              @if (formError) {
                <div class="form-error">{{ formError }}</div>
              }
              <div class="form-group">
                <label>Placa *</label>
                <input type="text" [(ngModel)]="form.plate" class="form-input" placeholder="ABC-123" />
              </div>
              <div class="form-group">
                <label>Tipo</label>
                <select [(ngModel)]="form.type" class="form-input">
                  <option value="truck">Camión recolector</option>
                  <option value="sweeper">Barredora</option>
                  <option value="compactor">Compactador</option>
                </select>
              </div>
              <div class="form-group">
                <label>Modelo</label>
                <input type="text" [(ngModel)]="form.model" class="form-input" placeholder="Ej: Chevrolet 2023" />
              </div>
              <div class="form-group">
                <label>Estado</label>
                <select [(ngModel)]="form.status" class="form-input">
                  <option value="active">Activo</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="out_of_service">Fuera de servicio</option>
                </select>
              </div>
              <div class="form-group">
                <label>Capacidad combustible (L)</label>
                <input type="number" [(ngModel)]="form.fuel_capacity" class="form-input" placeholder="200" />
              </div>
              <div class="form-row">
                <div class="form-group autocomplete">
                  <label>Nombre del conductor</label>
                  <input 
                    type="text" 
                    [(ngModel)]="form.driver_name" 
                    (input)="onDriverSearch($any($event.target).value)"
                    (blur)="onDriverBlur()"
                    class="form-input" 
                    placeholder="Buscar conductor..." 
                    autocomplete="off"
                  />
                  @if (showDriverDropdown && filteredDrivers.length > 0) {
                    <ul class="driver-dropdown">
                      @for (d of filteredDrivers; track d.id) {
                        <li (click)="selectDriver(d)">
                          <span class="driver-name">{{ d.name }}</span>
                          <span class="driver-phone">{{ d.phone || 'Sin teléfono' }}</span>
                        </li>
                      }
                    </ul>
                  }
                </div>
                <div class="form-group">
                  <label>Teléfono del conductor</label>
                  <input type="text" [(ngModel)]="form.driver_phone" class="form-input" placeholder="3001234567" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
              <button class="btn-save" (click)="saveVehicle()">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
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
    .vehicle-stats { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #eee; min-width: 150px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; display: block; color: #333; }
    .stat-card.active .stat-value { color: #1D9E75; }
    .stat-card.maintenance .stat-value { color: #EAB308; }
    .stat-card.out-of-service .stat-value { color: #EF4444; }
    .stat-label { font-size: 13px; color: #666; }
    .filters { display: flex; gap: 12px; margin-bottom: 20px; }
    .search-input, .filter-select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .search-input { width: 250px; }
    .vehicle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .vehicle-card { background: white; padding: 0; border-radius: 12px; border: 1px solid #eee; transition: box-shadow 0.2s; position: relative; }
    .vehicle-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .vehicle-card-content { padding: 20px; cursor: pointer; }
    .vehicle-icon { font-size: 32px; margin-bottom: 12px; }
    .vehicle-plate { font-size: 18px; font-weight: 600; display: block; }
    .vehicle-type { font-size: 13px; color: #666; display: block; }
    .vehicle-model { font-size: 12px; color: #999; display: block; margin-bottom: 8px; }
    .vehicle-driver { font-size: 12px; color: #666; display: block; }
    .vehicle-status { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; display: inline-block; }
    .vehicle-status.active { background: #E1F5EE; color: #0F6E56; }
    .vehicle-status.maintenance { background: #FEF3C7; color: #92400E; }
    .vehicle-status.out_of_service { background: #FEE2E2; color: #991B1B; }
    .delete-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer; font-size: 18px; opacity: 0.5; }
    .delete-btn:hover { opacity: 1; }
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
    .form-row { display: flex; gap: 12px; }
    .form-row .form-group { flex: 1; }
    .driver-dropdown { position: absolute; background: white; border: 1px solid #ddd; border-radius: 8px; max-height: 150px; overflow-y: auto; list-style: none; margin: 0; padding: 0; z-index: 10; width: calc(100% - 24px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .driver-dropdown li { padding: 10px 12px; cursor: pointer; display: flex; justify-content: space-between; }
    .driver-dropdown li:hover { background: #f5f5f5; }
    .driver-name { font-weight: 500; }
    .driver-phone { color: #666; font-size: 12px; }
    .autocomplete { position: relative; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; border-top: 1px solid #eee; }
    .btn-cancel { padding: 10px 20px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; }
    .btn-save { padding: 10px 20px; border: none; border-radius: 8px; background: #1D9E75; color: white; cursor: pointer; }
    .form-error { background: #FEE2E2; color: #991B1B; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
    .confirm-modal { max-width: 350px; text-align: center; }
    .confirm-modal h3 { margin: 0 0 12px; }
    .confirm-modal p { color: #666; margin: 0 0 20px; }
    .btn-delete { padding: 10px 20px; border: none; border-radius: 8px; background: #EF4444; color: white; cursor: pointer; }
    .btn-delete:disabled { opacity: 0.6; }
  `]
})
export class VehiclesComponent implements OnInit {
  private fleetSvc = inject(FleetService);
  private usersSvc = inject(UsersService);
  
  vehicles: Vehicle[] = [];
  drivers: User[] = [];
  filteredDrivers: User[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = '';
  
  showModal = false;
  editingId: string | null = null;
  saving = false;
  formError = '';
  form: any = { plate: '', type: 'truck', model: '', status: 'active', fuel_capacity: 200 };
  deleteId: string | null = null;
  deleting = false;
  showDriverDropdown = false;

  ngOnInit() {
    this.loadVehicles();
    this.loadDrivers();
  }

  loadDrivers() {
    this.usersSvc.getUsers({ limit: 500, user_type: 'driver' }).subscribe({
      next: res => {
        this.drivers = res.data.filter(u => u.user_type === 'driver');
        this.filteredDrivers = [...this.drivers];
      }
    });
  }

  onDriverSearch(term: string) {
    if (!term) {
      this.filteredDrivers = [...this.drivers];
    } else {
      this.filteredDrivers = this.drivers.filter(d => 
        d.name.toLowerCase().includes(term.toLowerCase())
      );
    }
    this.showDriverDropdown = this.filteredDrivers.length > 0;
  }

  onDriverBlur() {
    setTimeout(() => this.showDriverDropdown = false, 200);
  }

  selectDriver(driver: User) {
    this.form.driver_name = driver.name;
    this.form.driver_phone = driver.phone || '';
    this.filteredDrivers = [...this.drivers];
  }

  clearDriver() {
    this.form.driver_name = '';
    this.form.driver_phone = '';
  }

  loadVehicles() {
    this.loading = true;
    this.fleetSvc.getVehicles({ search: this.searchTerm || undefined, status: this.statusFilter || undefined }).subscribe({
      next: res => {
        this.vehicles = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get activeCount() { return this.vehicles.filter(v => v.status === 'active').length; }
  get maintenanceCount() { return this.vehicles.filter(v => v.status === 'maintenance').length; }
  get offCount() { return this.vehicles.filter(v => v.status === 'out_of_service').length; }

  getTypeLabel(type: string): string {
    return { truck: 'Camión recolector', sweeper: 'Barredora', compactor: 'Compactador' }[type] || type;
  }

  getStatusLabel(status: string): string {
    return { active: 'Activo', maintenance: 'Mantenimiento', out_of_service: 'Fuera de servicio' }[status] || status;
  }

  confirmDelete(id: string, event: Event) {
    event.stopPropagation();
    this.deleteId = id;
  }

  cancelDelete() {
    this.deleteId = null;
  }

  doDelete() {
    if (!this.deleteId) return;
    this.deleting = true;
    this.fleetSvc.deleteVehicle(this.deleteId).subscribe({
      next: () => {
        this.deleting = false;
        this.deleteId = null;
        this.loadVehicles();
      },
      error: (err: any) => {
        this.deleting = false;
        alert(err.error?.message || 'Error al eliminar vehículo');
        this.deleteId = null;
      }
    });
  }

  selectVehicle(v: Vehicle) {
    this.editingId = v.id;
    this.form = { 
      plate: v.plate, 
      type: v.type, 
      model: v.model || '', 
      status: v.status, 
      fuel_capacity: v.fuel_capacity || 200,
      driver_name: v.driver_name || '',
      driver_phone: v.driver_phone || ''
    };
    this.showModal = true;
  }

  openCreate() {
    this.editingId = null;
    this.form = { plate: '', type: 'truck', model: '', status: 'active', fuel_capacity: 200, driver_name: '', driver_phone: '' };
    this.formError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.formError = '';
  }

  saveVehicle() {
    if (!this.form.plate) {
      this.formError = 'La placa es obligatoria';
      return;
    }
    
    this.saving = true;
    this.formError = '';
    
    const data = {
      plate: this.form.plate.toUpperCase(),
      type: this.form.type,
      model: this.form.model || null,
      status: this.form.status,
      fuel_capacity: Number(this.form.fuel_capacity) || 0,
      driver_name: this.form.driver_name || null,
      driver_phone: this.form.driver_phone || null
    };

    const obs = this.editingId 
      ? this.fleetSvc.updateVehicle(this.editingId, data)
      : this.fleetSvc.createVehicle(data);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadVehicles();
      },
      error: (err: any) => {
        this.saving = false;
        this.formError = err.error?.message || 'Error al guardar vehículo';
      }
    });
  }
}