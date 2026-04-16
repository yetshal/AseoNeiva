import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FleetResponse, VehicleDetail, Vehicle } from '../../shared/models/fleet.model';

export interface NearbyReport {
  id: string;
  type: string;
  description: string;
  photoUrl: string | null;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
  userName: string | null;
  validated: boolean | null;
  validationNotes: string | null;
}

@Injectable({ providedIn: 'root' })
export class FleetService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/fleet`;

  getVehicles(filters: { status?: string; type?: string; search?: string } = {}) {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.type)   params = params.set('type',   filters.type);
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<FleetResponse>(this.base, { params });
  }

  getVehicleById(id: string) {
    return this.http.get<VehicleDetail>(`${this.base}/${id}`);
  }

  createVehicle(data: Partial<Vehicle>) {
    return this.http.post<{ vehicle: Vehicle }>(this.base, data);
  }

  updateVehicle(id: string, data: Partial<Vehicle>) {
    return this.http.patch<{ vehicle: Vehicle }>(`${this.base}/${id}`, data);
  }

  deleteVehicle(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  updateLocation(id: string, latitude: number, longitude: number) {
    return this.http.patch<{ vehicle: Vehicle }>(`${this.base}/${id}/location`, { latitude, longitude });
  }

  getNearbyReports(vehicleId: string, radius: number = 500) {
    const params = new HttpParams().set('radius', radius.toString());
    return this.http.get<{ data: NearbyReport[] }>(`${this.base}/${vehicleId}/nearby-reports`, { params });
  }

  validateReport(vehicleId: string, reportId: string, isValid: boolean, notes?: string) {
    return this.http.post<{ message: string; pointsAwarded: number; validated: boolean }>(
      `${this.base}/${vehicleId}/validate-report`,
      { reportId, isValid, notes }
    );
  }
}
