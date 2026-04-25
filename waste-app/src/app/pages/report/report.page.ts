import { Component, OnInit, inject, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as L from 'leaflet';
import { ReportService, Report } from '../../services/report.service';

@Component({
  selector: 'app-report-detail-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Detalle del Reporte</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="detail-container">
        <img [src]="report.photo_url" class="detail-img">
        <div class="detail-header">
          <h2>{{ report.type }}</h2>
          <span class="status-badge" [class]="report.status">{{ getStatusLabel(report.status || '') }}</span>
        </div>
        <p class="detail-desc">{{ report.description }}</p>
        <div class="detail-meta">
          <ion-item lines="none">
            <ion-icon name="calendar-outline" slot="start"></ion-icon>
            <ion-label>
              <p>Fecha de reporte</p>
              <h3>{{ report.created_at | date:'medium' }}</h3>
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-icon name="location-outline" slot="start"></ion-icon>
            <ion-label>
              <p>Coordenadas</p>
              <h3>{{ report.latitude }}, {{ report.longitude }}</h3>
            </ion-label>
          </ion-item>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .detail-container { text-align: center; }
    .detail-img { width: 100%; height: 250px; object-fit: cover; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; text-align: left; }
    .detail-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #1a1a1a; }
    .detail-desc { text-align: left; color: #4b5563; line-height: 1.5; margin-bottom: 20px; font-size: 15px; }
    .detail-meta { background: #f9fafb; border-radius: 12px; padding: 8px; }
    .status-badge { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.resolved { background: #d1fae5; color: #065f46; }
  `]
})
export class ReportDetailModal {
  @Input() report!: Report;
  private modalCtrl = inject(ModalController);

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = { 'pending': 'Pendiente', 'reviewing': 'En revisión', 'resolved': 'Resuelto', 'rejected': 'Rechazado' };
    return labels[status] || status;
  }
  dismiss() { this.modalCtrl.dismiss(); }
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="white">
        <ion-title mode="ios">Reportes Ciudadanos</ion-title>
      </ion-toolbar>
      <ion-toolbar color="white">
        <ion-segment [(ngModel)]="activeSegment" mode="ios" (ionChange)="segmentChanged()" class="custom-segment">
          <ion-segment-button value="new">
            <ion-label>Nuevo</ion-label>
          </ion-segment-button>
          <ion-segment-button value="history">
            <ion-label>Historial</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="report-content ion-padding">
      
      <!-- New Report Flow -->
      <div *ngIf="activeSegment === 'new'" class="animate-up">
        
        <div class="photo-capture-card shadow-premium" (click)="takePhoto()">
          @if (photoCaptured) {
            <img [src]="photoCaptured" class="captured-img">
            <div class="photo-overlay">
              <ion-icon name="camera"></ion-icon>
              <span>Capturar nueva foto</span>
            </div>
          } @else {
            <div class="empty-state">
              <div class="icon-orbit gradient-primary">
                <ion-icon name="camera"></ion-icon>
              </div>
              <h3>Capturar Evidencia</h3>
              <p>📷 Usa tu cámara para capturar una foto</p>
            </div>
          }
        </div>

        <div class="form-card shadow-premium">
          <div class="field-group">
            <label class="field-label">Ubicación</label>
            <div class="map-wrapper shadow-premium">
              <div #reportMap class="mini-map"></div>
              <button class="map-recenter" (click)="getCurrentLocation()">
                <ion-icon name="locate"></ion-icon>
              </button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Tipo de problema</label>
            <div class="select-modern">
              <select [(ngModel)]="selectedType">
                <option [ngValue]="null" disabled>Selecciona una opción</option>
                @for (type of problemTypes; track type) {
                  <option [value]="type">{{ type }}</option>
                }
              </select>
              <ion-icon name="chevron-down-outline" class="select-chevron"></ion-icon>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Detalles del reporte</label>
            <textarea [(ngModel)]="description" rows="3" placeholder="¿Qué está pasando?"></textarea>
          </div>

          <button class="submit-btn gradient-primary shadow-premium" (click)="submitReport()" [disabled]="!canSubmit() || submitting">
            <span *ngIf="!submitting">Enviar Reporte</span>
            <ion-spinner name="crescent" *ngIf="submitting"></ion-spinner>
          </button>
        </div>
      </div>

      <!-- History Flow -->
      <div *ngIf="activeSegment === 'history'" class="history-list animate-up">
        @for (report of reports; track report.id) {
          <div class="history-card shadow-premium" (click)="showDetail(report)">
            <div class="card-img">
              <img [src]="report.photo_url">
              <div class="status-pill" [class]="report.status">
                {{ report.status === 'pending' ? 'Pendiente' : 
                   report.status === 'resolved' ? 'Resuelto' : 'Revisando' }}
              </div>
            </div>
            <div class="card-body">
              <div class="card-meta">
                <span class="meta-date">{{ report.created_at | date:'dd MMM, h:mm a' }}</span>
                <ion-button fill="clear" color="danger" (click)="deleteReport(report.id!); $event.stopPropagation()" size="small" class="btn-delete">
                  <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
                </ion-button>
              </div>
              <h4 class="card-title">{{ report.type }}</h4>
              <p class="card-desc">{{ report.description }}</p>
            </div>
          </div>
        } @empty {
          <div class="empty-history-state">
            <div class="empty-icon">📂</div>
            <p>Tu historial está vacío</p>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .report-content { --background: var(--app-bg); }
    .custom-segment {
      padding: 8px 16px;
      --background: #f1f5f9;
      border-radius: 16px;
      margin: 10px 16px;
      
      ion-segment-button {
        --color: #64748b;
        --color-checked: #1D9E75;
        --indicator-color: white;
        --border-radius: 12px;
        margin: 2px;
        min-height: 40px;
        
        ion-label {
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.3px;
        }
      }
    }

    .photo-capture-card {
      height: 200px; background: white; border-radius: 24px; overflow: hidden;
      margin-bottom: 24px; position: relative; display: flex; align-items: center; justify-content: center;
      .captured-img { width: 100%; height: 100%; object-fit: cover; }
      .photo-overlay {
        position: absolute; bottom: 12px; right: 12px; background: rgba(255,255,255,0.9);
        padding: 8px 14px; border-radius: 12px; color: #1D9E75; font-weight: 700;
        display: flex; align-items: center; gap: 8px; font-size: 13px;
      }
      .empty-state {
        text-align: center;
        .icon-orbit { width: 56px; height: 56px; margin: 0 auto 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
        h3 { font-size: 16px; font-weight: 700; margin: 0; color: var(--app-text-main); }
        p { font-size: 13px; color: var(--app-text-muted); margin: 4px 0 0; }
      }
    }

    .form-card {
      background: white; border-radius: 24px; padding: 24px;
      .field-group { margin-bottom: 24px; .field-label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 10px; padding-left: 4px; } }
    }

    .map-wrapper {
      height: 140px; border-radius: 20px; overflow: hidden; position: relative;
      .mini-map { height: 100%; width: 100%; }
      .map-recenter { 
        position: absolute; bottom: 12px; right: 12px; z-index: 9999; 
        width: 36px; height: 36px; background: white; border-radius: 10px; 
        border: none; color: #1D9E75; font-size: 20px; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.2); 
        display: flex; align-items: center; justify-content: center;
      }
    }

    textarea, .select-modern { width: 100%; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 14px 16px; font-size: 15px; color: var(--app-text-main); font-weight: 500; &:focus { border-color: #1D9E75; outline: none; } }
    .select-modern { position: relative; padding: 0; select { width: 100%; background: transparent; border: none; padding: 14px 16px; appearance: none; font-weight: 600; color: var(--app-text-main); } .select-chevron { position: absolute; right: 16px; top: 15px; color: #94a3b8; pointer-events: none; } }

    .submit-btn { width: 100%; height: 56px; border: none; border-radius: 18px; color: white; font-size: 16px; font-weight: 800; &:disabled { opacity: 0.7; } }

    .history-card {
      background: white; border-radius: 24px; overflow: hidden; margin-bottom: 20px; display: flex; flex-direction: column;
      .card-img { height: 160px; position: relative; img { width: 100%; height: 100%; object-fit: cover; } .status-pill { position: absolute; top: 12px; left: 12px; padding: 6px 14px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: white; &.pending { background: #475569; } &.resolved { background: #1D9E75; } } }
      .card-body { padding: 20px; }
      .card-meta { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 600; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; }
      .card-title { font-size: 17px; font-weight: 800; color: var(--app-text-main); margin: 0 0 8px; }
      .card-desc { font-size: 13px; color: var(--app-text-muted); line-height: 1.5; margin: 0; }
      .btn-delete { margin: -10px -10px -10px 0; --padding-start: 8px; --padding-end: 8px; }
    }

    .empty-history-state { text-align: center; padding: 60px 20px; color: #94a3b8; .empty-icon { font-size: 48px; margin-bottom: 12px; } p { font-size: 15px; font-weight: 600; } }
    .animate-up { animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class ReportPage implements OnInit, AfterViewInit {
  @ViewChild('reportMap') mapContainer!: ElementRef;

  private reportService = inject(ReportService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);
  private modalCtrl = inject(ModalController);

  activeSegment: string = 'new';
  photoCaptured: string | null = null;
  selectedType: string | null = null;
  description: string = '';
  submitting = false;
  reports: Report[] = [];

  latitude: number = 2.9273;
  longitude: number = -75.2819;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  problemTypes = ['Basura acumulada', 'Camión no pasó', 'Contenedor dañado', 'Punto ilegal de residuos', 'Otros'];

  ngOnInit() { this.loadMyReports(); }

  ngAfterViewInit() { if (this.activeSegment === 'new') setTimeout(() => this.initMap(), 500); }

  segmentChanged() {
    if (this.activeSegment === 'new') {
      setTimeout(() => { this.initMap(); if (this.map) this.map.invalidateSize(); }, 100);
    } else { this.loadMyReports(); }
  }

  private initMap() {
    if (this.map) return;
    
    // Crear un icono personalizado elegante (SVG) para evitar el error de imagen rota
    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="background-color: #1D9E75; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.map = L.map(this.mapContainer.nativeElement, { center: [this.latitude, this.longitude], zoom: 16, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    
    this.marker = L.marker([this.latitude, this.longitude], { 
      draggable: true,
      icon: customIcon 
    }).addTo(this.map);

    this.marker.on('dragend', () => { const pos = this.marker!.getLatLng(); this.latitude = pos.lat; this.longitude = pos.lng; });
    
    // Forzar redibujado para evitar que el mapa aparezca gris o cortado
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 400);

    this.getCurrentLocation();
  }

  async getCurrentLocation() {
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      this.latitude = pos.coords.latitude;
      this.longitude = pos.coords.longitude;
      if (this.map && this.marker) {
        this.map.setView([this.latitude, this.longitude], 16);
        this.marker.setLatLng([this.latitude, this.longitude]);
      }
    } catch (e) { this.showToast('No se pudo obtener la ubicación exacta', 'warning'); }
  }

  async takePhoto() {
    try {
      // IMPORTANTE: Solo permite captura con cámara (CameraSource.Camera)
      // NO se puede seleccionar fotos de galería - debe ser captura en el momento
      const image = await Camera.getPhoto({ 
        quality: 90, 
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,  // Solo cámara, NUNCA galería
        promptLabelHeader: 'Capturar foto',
        promptLabelCancel: 'Cancelar'
      });
      this.photoCaptured = image.dataUrl || null;
    } catch (e) {
      // El usuario canceló la captura
      console.log('Captura cancelada');
    }
  }

  canSubmit() { return this.photoCaptured && this.selectedType && this.description.trim().length >= 5; }

  async submitReport() {
    if (!this.canSubmit()) return;
    this.submitting = true;
    const loading = await this.loadingCtrl.create({ message: 'Enviando...' });
    await loading.present();

    const newReport = { type: this.selectedType!, description: this.description.trim(), photo_url: this.photoCaptured!, latitude: this.latitude, longitude: this.longitude };
    this.reportService.createReport(newReport).subscribe({
      next: () => { loading.dismiss(); this.submitting = false; this.showToast('Reporte enviado', 'success'); this.resetForm(); this.activeSegment = 'history'; this.loadMyReports(); },
      error: () => { loading.dismiss(); this.submitting = false; this.showToast('Error de servidor', 'danger'); }
    });
  }

  loadMyReports() {
    this.reportService.getUserReports().subscribe({
      next: (res: any) => { this.reports = res.data || res; },
      error: () => this.showToast('Error al cargar historial', 'danger')
    });
  }

  async deleteReport(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar', message: '¿Borrar reporte?',
      buttons: [{ text: 'No', role: 'cancel' }, { text: 'Sí', handler: () => { this.reportService.deleteReport(id).subscribe(() => { this.showToast('Eliminado', 'success'); this.loadMyReports(); }); } }]
    });
    await alert.present();
  }

  async showDetail(report: Report) {
    const modal = await this.modalCtrl.create({
      component: ReportDetailModal,
      componentProps: { report }
    });
    await modal.present();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = { 'pending': 'Pendiente', 'resolved': 'Resuelto' };
    return labels[status] || status;
  }

  resetForm() { this.photoCaptured = null; this.selectedType = null; this.description = ''; }

  async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 2000, position: 'bottom' });
    t.present();
  }
}
