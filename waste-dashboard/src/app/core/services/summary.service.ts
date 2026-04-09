import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SummaryData } from '../../shared/models/summary.model';

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/summary`;

  getSummary() {
    return this.http.get<SummaryData>(this.base);
  }
}
