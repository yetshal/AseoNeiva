import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Report {
  id?: string;
  type: string;
  description: string;
  photo_url: string; // Coincide con backend
  latitude: number | string;
  longitude: number | string;
  status?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = (environment as any).apiUrl;

  createReport(report: any): Observable<any> {
    // Mapeamos a photo_url para el backend
    const body = {
      ...report,
      photoUrl: report.photo_url // El backend espera photoUrl en el body del POST según el controller
    };
    return this.http.post<any>(`${this.apiUrl}/reports`, body);
  }

  getUserReports(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/user`);
  }

  deleteReport(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reports/${id}`);
  }
}
