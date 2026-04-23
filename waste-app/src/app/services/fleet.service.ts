import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Vehicle {
  id: string;
  plate: string;
  model?: string;
  type: string;
  status: string;
  driver_name: string;
  driver_phone?: string;
  latitude: number | string;
  longitude: number | string;
  last_seen_at?: string;
  distance?: number; // Para cálculo local
}

@Injectable({
  providedIn: 'root'
})
export class FleetService {
  private http = inject(HttpClient);
  private apiUrl = (environment as any).apiUrl;

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<{ data: Vehicle[], total: number }>(`${this.apiUrl}/fleet`).pipe(
      map(response => response.data.map(v => ({
        ...v,
        latitude: Number(v.latitude),
        longitude: Number(v.longitude)
      })))
    );
  }

  getActiveVehicles(): Observable<Vehicle[]> {
    return this.http.get<{ data: Vehicle[] }>(`${this.apiUrl}/fleet/active`).pipe(
      map(response => response.data.map(v => ({
        ...v,
        latitude: Number(v.latitude),
        longitude: Number(v.longitude)
      })))
    );
  }
}
