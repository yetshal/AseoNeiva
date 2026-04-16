import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffService } from '../../core/services/staff.service';
import { StaffMember, AdminRole, CreateStaffPayload } from '../../shared/models/staff.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss'
})
export class StaffComponent implements OnInit {
  private svc  = inject(StaffService);
  private auth = inject(AuthService);
  private fb   = inject(FormBuilder);

  currentAdmin = this.auth.getAdmin();

  staff:   StaffMember[] = [];
  total    = 0;
  page     = 1;
  limit    = 20;
  loading  = true;
  error    = '';

  activeTab: 'admin' = 'admin';

  searchTerm    = '';
  roleFilter    = '';
  activeFilter  = '';

  showModal    = false;
  editingId:   string | null = null;
  modalError   = '';
  modalLoading = false;

  confirmDeleteId: string | null = null;

  form: FormGroup = this.fb.group({
    name:      ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.minLength(8)]],
    role:      ['operator', Validators.required],
    is_active: [true],
  });

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.loading = true;
    this.svc.getStaff({
      search:    this.searchTerm || undefined,
      role:      this.roleFilter || undefined,
      is_active: this.activeFilter || undefined,
      page:      this.page,
      limit:     this.limit,
    }).subscribe({
      next: res => {
        this.staff   = res.data;
        this.total   = res.total;
        this.loading = false;
      },
      error: () => {
        this.error   = 'No se pudo cargar el personal.';
        this.loading = false;
      }
    });
  }

  setActiveTab(tab: 'admin') {
    this.activeTab = tab;
    this.page = 1;
    this.loadStaff();
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ role: 'operator', is_active: true });
    this.form.get('password')!.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('password')!.updateValueAndValidity();
    this.modalError  = '';
    this.showModal   = true;
  }

  openEdit(member: StaffMember): void {
    this.editingId = member.id;
    this.form.patchValue({
      name:      member.name,
      email:     member.email,
      password:  '',
      role:      member.role,
      is_active: member.is_active,
    });
    this.form.get('password')!.clearValidators();
    this.form.get('password')!.updateValueAndValidity();
    this.modalError = '';
    this.showModal  = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.form.reset();
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.modalLoading = true;
    this.modalError   = '';

    const v = this.form.value;

    if (this.editingId) {
      const payload: any = { name: v.name, email: v.email, role: v.role, is_active: v.is_active };
      this.svc.update(this.editingId, payload).subscribe({
        next:  () => { this.closeModal(); this.loadStaff(); this.modalLoading = false; },
        error: (e: any) => { this.modalError = e.error?.message || 'Error al actualizar.'; this.modalLoading = false; }
      });
    } else {
      const payload: CreateStaffPayload = { name: v.name, email: v.email, password: v.password, role: v.role as AdminRole };
      this.svc.create(payload).subscribe({
        next:  () => { this.closeModal(); this.loadStaff(); this.modalLoading = false; },
        error: (e: any) => { this.modalError = e.error?.message || 'Error al crear el usuario.'; this.modalLoading = false; }
      });
    }
  }

confirmDelete(id: string): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  doDelete(): void {
    if (!this.confirmDeleteId) return;
    this.svc.delete(this.confirmDeleteId).subscribe({
      next: () => { this.confirmDeleteId = null; this.loadStaff(); },
      error: (e: any) => { this.error = e.error?.message || 'Error al eliminar.'; this.confirmDeleteId = null; }
    });
  }

  toggleActive(member: StaffMember): void {
    this.svc.update(member.id, { is_active: !member.is_active }).subscribe({
      next: () => this.loadStaff(),
      error: () => {}
    });
  }

  onSearch(): void { this.page = 1; this.loadStaff(); }
  onFilter(): void { this.page = 1; this.loadStaff(); }
  goToPage(p: number): void { this.page = p; this.loadStaff(); }

  get totalPages(): number { return Math.ceil(this.total / this.limit); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  roleLabel(role: string): string {
    switch (role) {
      case 'superadmin': return 'Super Admin';
      case 'admin':      return 'Administrador';
      case 'operator':   return 'Operador';
      default:           return role;
    }
  }

  canManage(member: StaffMember): boolean {
    if (member.id === this.currentAdmin?.id) return false;
    if (member.role === 'superadmin' && this.currentAdmin?.role !== 'superadmin') return false;
    return true;
  }

  isSuperAdmin(): boolean {
    return this.currentAdmin?.role === 'superadmin';
  }
}
