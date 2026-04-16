import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UsersResponse, UserDetail, Report, UserStats, UserType } from '../../shared/models/user.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  getStats() {
    return this.http.get<UserStats>(`${this.base}/stats`);
  }

  getUsers(filters: { search?: string; status?: string; user_type?: string; page?: number; limit?: number } = {}) {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.user_type) params = params.set('user_type', filters.user_type);
    params = params.set('page',  String(filters.page  ?? 1));
    params = params.set('limit', String(filters.limit ?? 20));
    return this.http.get<UsersResponse>(this.base, { params });
  }

  getUserById(id: string) {
    return this.http.get<{ user: UserDetail; reports: Report[] }>(`${this.base}/${id}`);
  }

  updateStatus(id: string, status: 'active' | 'inactive' | 'pending') {
    return this.http.patch<{ user: UserDetail }>(
      `${this.base}/${id}/status`,
      { status }
    );
  }

  updateUserType(id: string, userType: UserType) {
    return this.http.patch<{ message: string }>(
      `${this.base}/${id}/type`,
      { userType }
    );
  }

  createUser(data: { name: string; email: string; phone?: string; user_type: string; status: string }) {
    return this.http.post<{ user: any }>(this.base, data);
  }

  updateUser(id: string, data: { name?: string; email?: string; phone?: string; user_type?: string; status?: string }) {
    return this.http.patch<{ user: any }>(`${this.base}/${id}`, data);
  }
}