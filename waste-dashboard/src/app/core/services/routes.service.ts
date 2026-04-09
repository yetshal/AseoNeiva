import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  RoutesResponse, Route, AssignmentsResponse,
  Assignment, CreateAssignmentPayload
} from '../../shared/models/routes.model';

@Injectable({ providedIn: 'root' })
export class RoutesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/routes`;

  // ── Rutas ─────────────────────────────────────────────────

  getRoutes(filters: { status?: string; type?: string; zone?: string; search?: string } = {}) {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.type)   params = params.set('type',   filters.type);
    if (filters.zone)   params = params.set('zone',   filters.zone);
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<RoutesResponse>(this.base, { params });
  }

  getRouteById(id: string) {
    return this.http.get<{ route: Route; assignments: Assignment[] }>(`${this.base}/${id}`);
  }

  createRoute(data: Partial<Route>) {
    return this.http.post<{ route: Route }>(this.base, data);
  }

  updateRoute(id: string, data: Partial<Route>) {
    return this.http.patch<{ route: Route }>(`${this.base}/${id}`, data);
  }

  deleteRoute(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  // ── Asignaciones ─────────────────────────────────────────

  getAssignments(filters: { date?: string; vehicle_id?: string; route_id?: string; status?: string } = {}) {
    let params = new HttpParams();
    if (filters.date)       params = params.set('date',       filters.date);
    if (filters.vehicle_id) params = params.set('vehicle_id', filters.vehicle_id);
    if (filters.route_id)   params = params.set('route_id',   filters.route_id);
    if (filters.status)     params = params.set('status',     filters.status);
    return this.http.get<AssignmentsResponse>(`${this.base}/assignments`, { params });
  }

  createAssignment(data: CreateAssignmentPayload) {
    return this.http.post<{ assignment: Assignment }>(`${this.base}/assignments`, data);
  }

  updateAssignment(id: string, data: Partial<Assignment>) {
    return this.http.patch<{ assignment: Assignment }>(`${this.base}/assignments/${id}`, data);
  }

  deleteAssignment(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/assignments/${id}`);
  }
}
