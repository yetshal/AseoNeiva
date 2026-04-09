import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AnalysisFilters {
  period?: 'week' | 'month' | 'year';
  from?:   string;
  to?:     string;
}

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/analysis`;

  private buildParams(filters: AnalysisFilters): HttpParams {
    let params = new HttpParams();
    if (filters.period) params = params.set('period', filters.period);
    if (filters.from)   params = params.set('from',   filters.from);
    if (filters.to)     params = params.set('to',     filters.to);
    return params;
  }

  getReportsAnalysis(filters: AnalysisFilters = {}) {
    return this.http.get<any>(`${this.base}/reports`, { params: this.buildParams(filters) });
  }

  getFleetAnalysis(filters: AnalysisFilters = {}) {
    return this.http.get<any>(`${this.base}/fleet`, { params: this.buildParams(filters) });
  }

  getUsersAnalysis(filters: AnalysisFilters = {}) {
    return this.http.get<any>(`${this.base}/users`, { params: this.buildParams(filters) });
  }
}
