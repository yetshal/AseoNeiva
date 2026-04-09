import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header [translucent]="true" class="page-header">
      <ion-toolbar>
        <div class="header-content">
          <button class="back-btn" (click)="goBack()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <span class="header-title">Reportar problemas</span>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="report-content">
      <!-- Photo Section -->
      <div class="photo-section" (click)="takePhoto()" [class.has-photo]="photoCaptured">
        @if (photoCaptured) {
          <img [src]="photoCaptured" alt="Foto del reporte" class="captured-photo">
          <button class="retry-btn" (click)="takePhoto(); $event.stopPropagation()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        } @else {
          <div class="photo-placeholder">
            <div class="camera-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <span class="photo-text">Toca para tomar una foto</span>
            <span class="photo-hint">Solo se permite cámara en tiempo real</span>
          </div>
        }
      </div>

      <!-- Location Section -->
      <div class="location-section">
        <div class="section-header">
          <span class="section-title">Ubicación del reporte</span>
          <button class="refresh-btn" (click)="getLocation()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
        <div class="location-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ locationText }}</span>
        </div>
      </div>

      <!-- Problem Types -->
      <div class="types-section">
        <span class="section-title">Tipo de problema</span>
        <div class="types-grid">
          @for (type of problemTypes; track type.id) {
            <button 
              class="type-btn" 
              [class.selected]="selectedType === type.id"
              (click)="selectType(type.id)">
              <span class="type-icon">{{ type.icon }}</span>
              <span class="type-label">{{ type.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Description -->
      <div class="description-section">
        <span class="section-title">Descripción (opcional)</span>
        <textarea 
          [(ngModel)]="description" 
          placeholder="Describe el problema con más detalle..."
          rows="4"></textarea>
      </div>

      <!-- Submit -->
      <div class="submit-section">
        <button class="submit-btn" [disabled]="!canSubmit()" (click)="submitReport()">
          <span *ngIf="!submitting">Enviar reporte</span>
          <span *ngIf="submitting">Enviando...</span>
        </button>
      </div>

      <!-- History -->
      <div class="history-section">
        <h3 class="section-title">Mis reportes</h3>
        @if (reports.length === 0) {
          <div class="empty-history">
            <span>No has realizado ningún reporte</span>
          </div>
        } @else {
          <div class="reports-list">
            @for (report of reports; track report.id) {
              <div class="report-item">
                <div class="report-status" [class]="report.status">
                  {{ getStatusLabel(report.status) }}
                </div>
                <div class="report-type">{{ report.type }}</div>
                <div class="report-date">{{ report.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .page-header {
      ion-toolbar {
        --background: white;
        --border-width: 0 0 1px 0;
        --border-color: #ebebeb;
      }
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
    }

    .back-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #f0f0ed;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      svg { width: 18px; height: 18px; color: #666; }
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
    }

    .report-content {
      --background: #f9f9f7;
      --padding-top: 8px;
    }

    .photo-section {
      margin: 0 16px 16px;
      height: 180px;
      border-radius: 16px;
      overflow: hidden;
      border: 2px dashed #e0e0e0;
      cursor: pointer;
      position: relative;

      &.has-photo {
        border-style: solid;
        border-color: #1D9E75;
      }
    }

    .photo-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .camera-icon {
      width: 48px;
      height: 48px;
      background: #f0f0ed;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      svg { width: 24px; height: 24px; color: #888; }
    }

    .photo-text {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .photo-hint {
      font-size: 12px;
      color: #999;
    }

    .captured-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .retry-btn {
      position: absolute;
      bottom: 12px;
      right: 12px;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);

      svg { width: 20px; height: 20px; color: #666; }
    }

    .location-section, .types-section, .description-section, .history-section {
      padding: 0 16px;
      margin-bottom: 20px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      display: block;
      margin-bottom: 12px;
    }

    .refresh-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: #f0f0ed;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      svg { width: 16px; height: 16px; color: #666; }
    }

    .location-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: white;
      border-radius: 10px;
      font-size: 13px;
      color: #333;

      svg { width: 18px; height: 18px; color: #1D9E75; flex-shrink: 0; }
    }

    .types-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .type-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 16px;
      background: white;
      border: 2px solid #ebebeb;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s;

      &.selected {
        border-color: #1D9E75;
        background: #E1F5EE;
      }

      .type-icon { font-size: 24px; }
      .type-label { font-size: 12px; color: #666; font-weight: 500; }
    }

    .description-section textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      resize: none;
      outline: none;
      box-sizing: border-box;
      font-family: inherit;

      &:focus { border-color: #1D9E75; }
    }

    .submit-section {
      padding: 0 16px;
      margin-bottom: 24px;
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      background: #1D9E75;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;

      &:disabled { opacity: 0.5; }
    }

    .history-section {
      padding-bottom: 40px;
    }

    .empty-history {
      padding: 30px;
      text-align: center;
      color: #aaa;
      font-size: 13px;
      background: white;
      border-radius: 12px;
    }

    .reports-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .report-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 10px;
    }

    .report-status {
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 20px;
      font-weight: 500;

      &.pending { background: #FAEEDA; color: #854F0B; }
      &.reviewing { background: #E6F1FB; color: #185FA5; }
      &.resolved { background: #E1F5EE; color: #0F6E56; }
    }

    .report-type { flex: 1; font-size: 13px; font-weight: 500; }
    .report-date { font-size: 11px; color: #999; }
  `]
})
export class ReportPage {
  private router = inject(Router);

  photoCaptured: string | null = null;
  latitude: number | null = null;
  longitude: number | null = null;
  locationText = 'Obteniendo ubicación...';
  selectedType: string | null = null;
  description = '';
  submitting = false;

  problemTypes = [
    { id: 'basura', label: 'Basura acumulada', icon: '🗑️' },
    { id: 'camion', label: 'Camión no pasó', icon: '🚛' },
    { id: 'contenedor', label: 'Contenedor dañado', icon: '🛑' },
    { id: 'punto', label: 'Punto ilegal', icon: '⚠️' }
  ];

  reports = [
    { id: '1', type: 'Basura acumulada', status: 'resolved', created_at: new Date('2026-04-01') },
    { id: '2', type: 'Camión no pasó', status: 'reviewing', created_at: new Date('2026-04-05') }
  ];

  constructor() {
    this.getLocation();
  }

  async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      this.locationText = `Lat: ${this.latitude.toFixed(4)}, Lng: ${this.longitude.toFixed(4)}`;
    } catch {
      this.locationText = 'Ubicación no disponible';
    }
  }

  takePhoto() {
    // In production, would use Camera plugin
    this.photoCaptured = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjAwIDE1MCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNlOGU4ZTgiLz48dGV4dCB4PSIxMDAiIHk9Ijc1IiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5BcnJlZ2EgMTwvL3RleHQ+PC9zdmc+';
  }

  selectType(id: string) {
    this.selectedType = id;
  }

  canSubmit(): boolean {
    return !!this.selectedType;
  }

  submitReport() {
    if (!this.canSubmit()) return;
    this.submitting = true;
    
    setTimeout(() => {
      this.submitting = false;
      this.photoCaptured = null;
      this.selectedType = null;
      this.description = '';
    }, 1500);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'reviewing': return 'En revisión';
      case 'resolved': return 'Resuelto';
      default: return status;
    }
  }

  goBack() {
    this.router.navigate(['/tabs/home']);
  }
}
