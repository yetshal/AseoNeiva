import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StaffResponse, StaffMember, CreateStaffPayload, UpdateStaffPayload } from '../../shared/models/staff.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/staff`;

  getStaff(filters: { search?: string; role?: string; is_active?: string; page?: number; limit?: number } = {}) {
    let params = new HttpParams();
    if (filters.search)    params = params.set('search',    filters.search);
    if (filters.role)      params = params.set('role',      filters.role);
    if (filters.is_active !== undefined) params = params.set('is_active', String(filters.is_active));
    params = params.set('page',  String(filters.page  ?? 1));
    params = params.set('limit', String(filters.limit ?? 20));
    return this.http.get<StaffResponse>(this.base, { params });
  }

  getById(id: string) {
    return this.http.get<{ admin: StaffMember }>(`${this.base}/${id}`);
  }

  create(data: CreateStaffPayload) {
    return this.http.post<{ admin: StaffMember }>(this.base, data);
  }

  update(id: string, data: UpdateStaffPayload) {
    return this.http.patch<{ admin: StaffMember }>(`${this.base}/${id}`, data);
  }

  changePassword(id: string, password: string) {
    return this.http.patch<{ message: string }>(`${this.base}/${id}/password`, { password });
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
