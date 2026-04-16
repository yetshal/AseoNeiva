import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Report {
  id: string;
  type: string;
  description: string;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  validation: {
    isValid: boolean;
    notes: string | null;
    validatedAt: string;
    validatedBy: string;
  } | null;
}

export interface ReportsResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reports`;

  getReports(options: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Observable<ReportsResponse> {
    let params = new HttpParams()
      .set('page', options.page || 1)
      .set('limit', options.limit || 20);

    if (options.status && options.status !== 'all') {
      params = params.set('status', options.status);
    }

    if (options.type && options.type !== 'all') {
      params = params.set('type', options.type);
    }

    if (options.search) {
      params = params.set('search', options.search);
    }

    return this.http.get<ReportsResponse>(this.baseUrl, { params });
  }

  getReport(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { status });
  }

  validateReport(reportId: string, isValid: boolean, notes?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${reportId}/validate`, { isValid, notes });
  }
}