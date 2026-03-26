import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { UsersService } from '../../../core/services/users.service';
import { User, UserStats } from '../../../shared/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  private svc    = inject(UsersService);
  private router = inject(Router);

  stats: UserStats = { totalUsers: 0, activeUsers: 0, totalPoints: 0, totalReports: 0 };
  users: User[]    = [];
  total            = 0;
  page             = 1;
  limit            = 20;
  loading          = true;

  searchTerm   = '';
  statusFilter = '';

  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.loadStats();
    this.loadUsers();

    this.search$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(term => {
        this.page = 1;
        return this.svc.getUsers({ search: term, status: this.statusFilter, page: 1, limit: this.limit });
      })
    ).subscribe(res => {
      this.users   = res.data;
      this.total   = res.total;
      this.loading = false;
    });
  }

  loadStats(): void {
    this.svc.getStats().subscribe(s => this.stats = s);
  }

  loadUsers(): void {
    this.loading = true;
    this.svc.getUsers({
      search: this.searchTerm,
      status: this.statusFilter,
      page:   this.page,
      limit:  this.limit
    }).subscribe(res => {
      this.users   = res.data;
      this.total   = res.total;
      this.loading = false;
    });
  }

  onSearch(term: string): void {
    this.search$.next(term);
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.page = 1;
    this.loadUsers();
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadUsers();
  }

  viewUser(id: string): void {
    this.router.navigate(['/dashboard/usuarios', id]);
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}