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
        <ion-segment [(ngModel)]="activeSegment" mode="ios" (ionChange)="segmentChanged()">
          <ion-segment-button value="new">
            <ion-label>Nuevo Reporte</ion-label>
          </ion-segment-button>
          <ion-segment-button value="history">
            <ion-label>Mis Reportes</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="report-content">
      <div *ngIf="activeSegment === 'new'" class="animate-fade">
        <div class="photo-card" (click)="takePhoto()" [class.has-photo]="photoCaptured">
          @if (photoCaptured) {
            <img [src]="photoCaptured" alt="Reporte" class="img-full">
            <div class="badge-change">
              <ion-icon name="camera-reverse-outline"></ion-icon>
              <span>Cambiar Foto</span>
            </div>
          } @else {
            <div class="empty-photo">
              <div class="icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:32px">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <h3>Capturar Evidencia</h3>
              <p>Toma una foto real del problema</p>
            </div>
          }
        </div>

        <div class="section-card">
          <div class="card-header">
            <ion-icon name="location-outline" color="primary"></ion-icon>
            <ion-label>Ubicación</ion-label>
            <ion-button fill="clear" size="small" (click)="getCurrentLocation()">
              <ion-icon name="locate-outline"></ion-icon>
            </ion-button>
          </div>
          <div #reportMap class="map-view"></div>
        </div>

        <div class="section-card">
          <div class="input-item">
            <ion-label position="stacked">Tipo de Incidente</ion-label>
            <ion-select [(ngModel)]="selectedType" placeholder="Selecciona el problema" interface="action-sheet" class="custom-select">
              @for (type of problemTypes; track type) {
                <ion-select-option [value]="type">{{ type }}</ion-select-option>
              }
            </ion-select>
          </div>
          <div class="input-item">
            <ion-label position="stacked">Descripción</ion-label>
            <textarea [(ngModel)]="description" placeholder="Escribe detalles aquí..." rows="4"></textarea>
          </div>
        </div>

        <div class="ion-padding">
          <ion-button expand="block" mode="ios" (click)="submitReport()" [disabled]="!canSubmit() || submitting" class="btn-main">
            {{ submitting ? 'Enviando...' : 'Enviar Reporte' }}
          </ion-button>
        </div>
      </div>

      <div *ngIf="activeSegment === 'history'" class="animate-fade ion-padding">
        @for (report of reports; track report.id) {
          <div class="history-card" (click)="showDetail(report)">
            <div class="history-thumb">
              <img [src]="report.photo_url" alt="thumb">
            </div>
            <div class="history-data">
              <span class="type-text">{{ report.type }}</span>
              <span class="date-text">{{ report.created_at | date:'dd/MM/yyyy' }}</span>
              <div class="status-badge" [class]="report.status">{{ getStatusLabel(report.status || '') }}</div>
            </div>
            <ion-button fill="clear" color="danger" (click)="deleteReport(report.id!); $event.stopPropagation()">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-button>
          </div>
        } @empty {
          <div class="empty-history">
            <ion-icon name="document-text-outline"></ion-icon>
            <p>No has realizado reportes</p>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    .report-content { --background: #f4f6f9; }
    .animate-fade { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .photo-card { margin: 16px; height: 200px; border-radius: 20px; background: white; border: 2px dashed #d1d5db; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.2s; &.has-photo { border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); } }
    .empty-photo { text-align: center; padding: 20px; .icon-circle { width: 50px; height: 50px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: #6b7280; } h3 { margin: 0; font-size: 15px; font-weight: 700; color: #374151; } p { margin: 4px 0 0; font-size: 11px; color: #9ca3af; } }
    .img-full { width: 100%; height: 100%; object-fit: cover; }
    .badge-change { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 4px; font-size: 11px; }
    .section-card { background: white; margin: 0 16px 16px; border-radius: 16px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; ion-label { font-weight: 700; color: #374151; flex: 1; } } }
    .map-view { height: 150px; border-radius: 12px; overflow: hidden; }
    .input-item { margin-bottom: 16px; ion-label { font-size: 13px; font-weight: 600; color: #4b5563; margin-bottom: 8px; display: block; } }
    .custom-select { --background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; }
    textarea { width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; font-family: inherit; font-size: 14px; outline: none; }
    .btn-main { --border-radius: 12px; height: 50px; font-weight: 700; }
    .history-card { background: white; border-radius: 14px; padding: 10px; display: flex; align-items: center; gap: 12px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); .history-thumb { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } } .history-data { flex: 1; display: flex; flex-direction: column; gap: 2px; } .type-text { font-size: 14px; font-weight: 700; color: #1f2937; } .date-text { font-size: 11px; color: #6b7280; } }
    .status-badge { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; width: fit-content; &.pending { background: #fef3c7; color: #92400e; } &.resolved { background: #d1fae5; color: #065f46; } }
    .empty-history { text-align: center; padding: 40px; color: #9ca3af; ion-icon { font-size: 40px; } }
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
    this.map = L.map(this.mapContainer.nativeElement, { center: [this.latitude, this.longitude], zoom: 16, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.marker = L.marker([this.latitude, this.longitude], { draggable: true }).addTo(this.map);
    this.marker.on('dragend', () => { const pos = this.marker!.getLatLng(); this.latitude = pos.lat; this.longitude = pos.lng; });
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
      const image = await Camera.getPhoto({ quality: 90, resultType: CameraResultType.DataUrl, source: CameraSource.Camera });
      this.photoCaptured = image.dataUrl || null;
    } catch (e) {}
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
