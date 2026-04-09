import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoutesService } from '../../core/services/routes.service';
import { FleetService } from '../../core/services/fleet.service';
import { Route, Assignment, AssignmentShift, CreateAssignmentPayload } from '../../shared/models/routes.model';
import { Vehicle } from '../../shared/models/fleet.model';

@Component({
  selector: 'app-route-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './route-planner.component.html',
  styleUrl: './route-planner.component.scss'
})
export class RoutePlannerComponent implements OnInit {
  private routesSvc = inject(RoutesService);
  private fleetSvc  = inject(FleetService);

  // ── Estado general ─────────────────────────────────────
  routes:      Route[]      = [];
  vehicles:    Vehicle[]    = [];
  assignments: Assignment[] = [];

  selectedDate  = new Date().toISOString().slice(0, 10);
  selectedView: 'planner' | 'routes' = 'planner';

  loading = true;
  error   = '';

  // ── Modal nueva asignación ─────────────────────────────
  showAssignModal  = false;
  assignForm = {
    route_id:     '',
    vehicle_id:   '',
    assigned_date: this.selectedDate,
    shift:         'morning' as AssignmentShift,
    notes:         '',
  };
  assignError   = '';
  assignLoading = false;

  // ── Modal nueva ruta ────────────────────────────────────
  showRouteModal = false;
  routeForm = {
    name:        '',
    description: '',
    zone:        '',
    type:        'collection' as 'collection' | 'sweeping',
    color:       '#1D9E75',
  };
  routeError   = '';
  routeLoading = false;

  // ── Confirm delete ─────────────────────────────────────
  confirmDeleteAssignId: string | null = null;
  confirmDeleteRouteId:  string | null = null;

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    let done = 0;
    const check = () => { if (++done === 3) this.loading = false; };

    this.routesSvc.getRoutes().subscribe({
      next:  r => { this.routes = r.data; check(); },
      error: () => { this.error = 'Error al cargar rutas.'; check(); }
    });

    this.fleetSvc.getVehicles({ status: 'active' }).subscribe({
      next:  r => { this.vehicles = r.data; check(); },
      error: () => { check(); }
    });

    this.loadAssignments(check);
  }

  loadAssignments(cb?: () => void): void {
    this.routesSvc.getAssignments({ date: this.selectedDate }).subscribe({
      next:  r => { this.assignments = r.data; cb?.(); },
      error: () => { cb?.(); }
    });
  }

  onDateChange(): void {
    this.assignForm.assigned_date = this.selectedDate;
    this.loadAssignments();
  }

  // ── Asignaciones ───────────────────────────────────────
  openAssignModal(): void {
    this.assignForm = {
      route_id: '', vehicle_id: '',
      assigned_date: this.selectedDate, shift: 'morning', notes: '',
    };
    this.assignError  = '';
    this.showAssignModal = true;
  }

  closeAssignModal(): void { this.showAssignModal = false; }

  createAssignment(): void {
    if (!this.assignForm.route_id || !this.assignForm.vehicle_id) {
      this.assignError = 'Selecciona una ruta y un vehículo.';
      return;
    }
    this.assignLoading = true;
    const payload: CreateAssignmentPayload = {
      route_id:      this.assignForm.route_id,
      vehicle_id:    this.assignForm.vehicle_id,
      assigned_date: this.assignForm.assigned_date,
      shift:         this.assignForm.shift,
      notes:         this.assignForm.notes || undefined,
    };
    this.routesSvc.createAssignment(payload).subscribe({
      next: () => { this.closeAssignModal(); this.loadAssignments(); this.assignLoading = false; },
      error: (e: any) => { this.assignError = e.error?.message || 'Error al asignar.'; this.assignLoading = false; }
    });
  }

  updateAssignmentStatus(id: string, status: string): void {
    this.routesSvc.updateAssignment(id, { status } as any).subscribe({
      next: () => this.loadAssignments(),
      error: () => {}
    });
  }

  confirmDeleteAssignment(id: string): void { this.confirmDeleteAssignId = id; }
  cancelDeleteAssignment(): void { this.confirmDeleteAssignId = null; }
  doDeleteAssignment(): void {
    if (!this.confirmDeleteAssignId) return;
    this.routesSvc.deleteAssignment(this.confirmDeleteAssignId).subscribe({
      next: () => { this.confirmDeleteAssignId = null; this.loadAssignments(); },
      error: () => { this.confirmDeleteAssignId = null; }
    });
  }

  // ── Rutas ──────────────────────────────────────────────
  openRouteModal(): void {
    this.routeForm = { name: '', description: '', zone: '', type: 'collection', color: '#1D9E75' };
    this.routeError  = '';
    this.showRouteModal = true;
  }

  closeRouteModal(): void { this.showRouteModal = false; }

  createRoute(): void {
    if (!this.routeForm.name) { this.routeError = 'El nombre de la ruta es obligatorio.'; return; }
    this.routeLoading = true;
    this.routesSvc.createRoute(this.routeForm as any).subscribe({
      next: () => {
        this.closeRouteModal();
        this.routesSvc.getRoutes().subscribe(r => this.routes = r.data);
        this.routeLoading = false;
      },
      error: (e: any) => { this.routeError = e.error?.message || 'Error al crear ruta.'; this.routeLoading = false; }
    });
  }

  confirmDeleteRoute(id: string): void { this.confirmDeleteRouteId = id; }
  cancelDeleteRoute(): void { this.confirmDeleteRouteId = null; }
  doDeleteRoute(): void {
    if (!this.confirmDeleteRouteId) return;
    this.routesSvc.deleteRoute(this.confirmDeleteRouteId).subscribe({
      next: () => {
        this.confirmDeleteRouteId = null;
        this.routesSvc.getRoutes().subscribe(r => this.routes = r.data);
      },
      error: () => { this.confirmDeleteRouteId = null; }
    });
  }

  // ── Helpers ────────────────────────────────────────────
  shiftLabel(s: string): string {
    switch (s) {
      case 'morning':   return 'Mañana';
      case 'afternoon': return 'Tarde';
      case 'night':     return 'Noche';
      default: return s;
    }
  }

  statusLabel(s: string): string {
    switch (s) {
      case 'pending':     return 'Pendiente';
      case 'in_progress': return 'En camino';
      case 'completed':   return 'Completado';
      case 'cancelled':   return 'Cancelado';
      default: return s;
    }
  }

  typeLabel(t: string): string {
    return t === 'collection' ? 'Recolección' : 'Barrido';
  }

  get activeRoutes():  Route[] { return this.routes.filter(r => r.status === 'active'); }
  get allVehicles():   Vehicle[] { return this.vehicles; }

  assignmentsByShift(shift: string): Assignment[] {
    return this.assignments.filter(a => a.shift === shift);
  }
}
