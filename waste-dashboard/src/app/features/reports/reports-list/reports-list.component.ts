import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService, Report } from '../../../core/services/reports.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">Reportes ciudadanos</h1>
      <div class="filters">
        <input
          type="text"
          class="search-input"
          placeholder="Buscar reportes..."
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearch()" />
        <select [(ngModel)]="statusFilter" (change)="loadReports()" class="filter-select">
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="rejected">Inválidos</option>
          <option value="resolved">Resueltos</option>
        </select>
        <select [(ngModel)]="typeFilter" (change)="loadReports()" class="filter-select">
          <option value="all">Todos los tipos</option>
          <option value="Basura acumulada">Basura acumulada</option>
          <option value="Camión no llegó">Camión no llegó</option>
          <option value="Punto ilegal">Punto ilegal</option>
          <option value="Daño en contenedor">Daño en contenedor</option>
        </select>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <span class="stat-value">{{ stats.total }}</span>
        <span class="stat-label">Total reportes</span>
      </div>
      <div class="stat-card pending">
        <span class="stat-value">{{ stats.pending }}</span>
        <span class="stat-label">Pendientes</span>
      </div>
      <div class="stat-card valid">
        <span class="stat-value">{{ stats.validated }}</span>
        <span class="stat-label">Resueltos</span>
      </div>
    </div>

    <div class="reports-list">
      @if (loading) {
        <div class="loading">Cargando...</div>
      }

      @for (report of reports; track report.id) {
        <div class="report-card" [class.pending]="report.status === 'pending'" [class.rejected]="report.status === 'rejected'" [class.resolved]="report.status === 'resolved'" (click)="openModal(report)">
          <div class="report-row">
            <div class="report-info">
              <span class="report-type">{{ report.type }}</span>
              <span class="report-status" [class]="report.status">{{ getStatusLabel(report.status) }}</span>
            </div>
            <div class="report-user-info" *ngIf="report.user">
              <span class="user-name">{{ report.user.name }}</span>
            </div>
          </div>
          <p class="report-description">{{ report.description }}</p>
          <div class="report-footer">
            <span class="report-date">{{ report.createdAt | date:'dd/MM/yyyy, h:mm a' }}</span>
            <span class="report-photo-badge" *ngIf="report.photoUrl">📷 Foto</span>
            <span class="report-location-badge" *ngIf="report.latitude">📍 Ubicación</span>
          </div>
        </div>
      }

      @if (!loading && reports.length === 0) {
        <div class="empty">No hay reportes</div>
      }
    </div>

    <div class="pagination">
      <button [disabled]="page === 1" (click)="goToPage(page - 1)">← Anterior</button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button [disabled]="page >= totalPages" (click)="goToPage(page + 1)">Siguiente →</button>
    </div>

    @if (selectedReport) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ selectedReport.type }}</h2>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="detail-row">
              <span class="detail-label">Estado:</span>
              <span class="status-badge" [class]="selectedReport.status">{{ getStatusLabel(selectedReport.status) }}</span>
            </div>
            
            @if (selectedReport.user) {
              <div class="detail-row">
                <span class="detail-label">Reportado por</span>
                <span class="detail-value">{{ selectedReport.user.name }} ({{ selectedReport.user.email }})</span>
              </div>
            }
            
            <div class="detail-row">
              <span class="detail-label">Fecha</span>
              <span class="detail-value">{{ selectedReport.createdAt | date:'medium' }}</span>
            </div>

            @if (selectedReport.latitude && selectedReport.longitude) {
              <div class="detail-row">
                <span class="detail-label">Ubicación</span>
                <span class="detail-value">{{ selectedReport.latitude }}, {{ selectedReport.longitude }}</span>
              </div>
            }

            @if (selectedReport.description) {
              <div class="description-section">
                <span class="detail-label">Descripción</span>
                <p class="description-text">{{ selectedReport.description }}</p>
              </div>
            }

            @if (selectedReport.photoUrl) {
              <div class="photo-section">
                <span class="detail-label">Foto adjunta</span>
                <div class="photo-container">
                  <img [src]="selectedReport.photoUrl" alt="Foto del reporte" />
                </div>
              </div>
            }

            <hr class="divider" />

            @if (selectedReport.validation && selectedReport.validation.isValid === true) {
              <div class="validation-section">
                <span class="footer-label">Reporte válido - solo puede invalidar:</span>
                <div class="validation-buttons">
                  <button class="btn-invalid" (click)="validateReport(selectedReport, false)">↻ Invalidar (-5 pts)</button>
                </div>
              </div>
            } @else if (selectedReport.validation && selectedReport.validation.isValid === false) {
              <div class="validation-section">
                <span class="footer-label">Reporte inválido - solo puede validar:</span>
                <div class="validation-buttons">
                  <button class="btn-valid" (click)="validateReport(selectedReport, true)">↻ Revalidar (+5 pts)</button>
                </div>
              </div>
            } @else {
              <div class="validation-section">
                <span class="footer-label">Validar reporte:</span>
                <div class="validation-buttons">
                  <button class="btn-valid" (click)="validateReport(selectedReport, true)">✓ Validar y dar puntos</button>
                  <button class="btn-invalid" (click)="validateReport(selectedReport, false)">✗ Invalidar</button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-title { font-size: 24px; font-weight: 600; margin: 0; }
    .filters { display: flex; gap: 12px; }
    .filter-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: white; }
    .search-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; width: 200px; }
    .stats-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #eee; }
    .stat-value { font-size: 28px; font-weight: 700; display: block; }
    .stat-label { font-size: 13px; color: #666; }
    .reports-list { display: flex; flex-direction: column; gap: 12px; }
    .report-card { background: white; padding: 16px; border-radius: 12px; border-left: 4px solid #ddd; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; }
    .report-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .report-card.pending { border-left-color: #FAEEDA; }
    .report-card.reviewing { border-left-color: #E6F1FB; }
    .report-card.rejected { border-left-color: #FEE2E2; }
    .report-card.resolved { border-left-color: #1D9E75; }
    .report-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .report-info { display: flex; align-items: center; gap: 8px; }
    .report-type { font-weight: 600; }
    .report-status { font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
    .report-status.pending { background: #FAEEDA; color: #854F0B; }
    .report-status.reviewing { background: #E6F1FB; color: #185FA5; }
    .report-status.rejected { background: #FEE2E2; color: #991B1B; }
    .report-status.resolved { background: #E1F5EE; color: #0F6E56; }
    .report-description { margin: 0 0 12px; color: #333; font-size: 14px; }
    .report-footer { display: flex; gap: 12px; align-items: center; font-size: 12px; color: #888; }
    .report-photo-badge, .report-location-badge { background: #f0f0ed; padding: 2px 8px; border-radius: 4px; }
    .loading, .empty { text-align: center; padding: 40px; color: #888; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
    .pagination button { padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 16px; width: 90%; max-width: 550px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #eee; }
    .modal-header h2 { margin: 0; font-size: 18px; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #666; }
    .modal-body { padding: 20px; }
    .detail-section { margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
    .detail-label { font-size: 13px; color: #888; }
    .detail-value { font-size: 13px; color: #333; text-align: right; }
    .status-badge { font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 500; }
    .status-badge.pending { background: #FAEEDA; color: #854F0B; }
    .status-badge.reviewing { background: #E6F1FB; color: #185FA5; }
    .status-badge.rejected { background: #FEE2E2; color: #991B1B; }
    .status-badge.resolved { background: #E1F5EE; color: #0F6E56; }
    .description-section { margin: 16px 0; padding: 12px; background: #f9f9f9; border-radius: 8px; }
    .description-text { margin: 8px 0 0; font-size: 14px; color: #333; }
    .photo-section { margin: 16px 0; }
    .photo-container { margin-top: 8px; border-radius: 8px; overflow: hidden; }
    .photo-container img { width: 100%; max-height: 300px; object-fit: contain; background: #f5f5f5; }
    .map-section { margin: 16px 0; }
    .map-container { height: 200px; margin-top: 8px; border-radius: 8px; overflow: hidden; }
    #report-map { width: 100%; height: 100%; }
    .modal-footer { padding: 16px 20px; border-top: 1px solid #eee; }
    .footer-label { font-size: 13px; color: #666; display: block; margin-bottom: 8px; }
    .status-buttons, .validation-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn-status { padding: 8px 16px; border-radius: 6px; border: 1px solid #ddd; background: white; font-size: 13px; cursor: pointer; }
    .btn-status:hover { background: #f5f5f5; }
    .btn-status.active { color: white; border-color: transparent; }
    .btn-status.pending.active { background: #854F0B; }
    .btn-status.reviewing.active { background: #185FA5; }
    .btn-status.rejected.active { background: #991B1B; }
    .btn-status.resolved.active { background: #1D9E75; }
    .validation-section { padding: 0 20px 16px; }
    .btn-valid, .btn-invalid { padding: 10px 16px; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .btn-valid { background: #1D9E75; color: white; }
    .btn-invalid { background: #D85A30; color: white; }
  `]
})
export class ReportsListComponent implements OnInit {
  private reportsService = inject(ReportsService);
  
  reports: Report[] = [];
  loading = true;
  page = 1;
  limit = 20;
  total = 0;
  statusFilter = '';
  typeFilter = '';
  searchTerm = '';
  stats = { total: 0, pending: 0, validated: 0 };
  selectedReport: Report | null = null;
  private map: L.Map | null = null;

  ngOnInit() {
    this.loadReports();
  }

  onSearch(): void {
    this.page = 1;
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.reportsService.getReports({
      search: this.searchTerm || undefined,
      status: this.statusFilter,
      type: this.typeFilter,
      page: this.page,
      limit: this.limit
    }).subscribe({
      next: (res) => {
        this.reports = res.data;
        this.total = res.total;
        this.loading = false;
        this.calcStats();
      },
      error: () => { this.loading = false; }
    });
  }

  calcStats() {
    this.stats.total = this.total;
    this.stats.pending = this.reports.filter(r => r.status === 'pending' && !r.validation).length;
    this.stats.validated = this.reports.filter(r => r.status === 'resolved').length;
  }

  goToPage(p: number) {
    this.page = p;
    this.loadReports();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  getStatusLabel(status: string): string {
    return { pending: 'Pendiente', rejected: 'Inválido', resolved: 'Resuelto' }[status] || status;
  }

  openModal(report: Report) {
    this.selectedReport = report;
    setTimeout(() => this.initMap(), 100);
  }

  closeModal() {
    this.selectedReport = null;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap() {
    if (!this.selectedReport?.latitude || !this.selectedReport?.longitude) return;
    const el = document.getElementById('report-map');
    if (!el) return;
    this.map = L.map('report-map').setView([this.selectedReport.latitude, this.selectedReport.longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(this.map);
    L.marker([this.selectedReport.latitude, this.selectedReport.longitude]).addTo(this.map).bindPopup(this.selectedReport.type);
  }

  updateStatus(report: Report, newStatus: string) {
    this.reportsService.updateStatus(report.id, newStatus).subscribe({
      next: () => {
        report.status = newStatus as any;
        this.selectedReport = { ...report };
        this.calcStats();
      },
      error: () => alert('Error al actualizar estado')
    });
  }

  validateReport(report: Report, isValid: boolean) {
    const notes = isValid ? 'Reporte verificado' : 'Reporte no válido';
    if (confirm(isValid ? '¿Validar y dar 5 puntos al usuario?' : '¿Marcar como inválido?')) {
      this.reportsService.validateReport(report.id, isValid, notes).subscribe({
        next: () => {
          const idx = this.reports.findIndex(r => r.id === report.id);
          if (idx >= 0) {
            const prevValidation = this.reports[idx].validation;
            const wasValid = prevValidation ? prevValidation.isValid : null;
            
            this.reports[idx] = {
              ...this.reports[idx],
              status: isValid ? 'resolved' as const : 'rejected' as const,
              validation: {
                isValid: isValid,
                notes: notes,
                validatedAt: new Date().toISOString(),
                validatedBy: ''
              }
            };
            this.selectedReport = this.reports[idx];
          }
          this.calcStats();
        },
        error: (err) => alert(err.error?.message || 'Error')
      });
    }
  }
}