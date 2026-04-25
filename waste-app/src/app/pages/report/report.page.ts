import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { Report, ReportService } from '../../services/report.service';

@Component({
  selector: 'app-report-detail-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header class="ion-no-border modal-header">
      <ion-toolbar>
        <ion-title>Detalle del reporte</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="detail-content">
      <div class="detail-shell">
        <img [src]="report.photo_url" class="detail-img" alt="Evidencia del reporte">

        <div class="detail-title-row">
          <div>
            <span class="app-eyebrow">Reporte ciudadano</span>
            <h2>{{ report.type }}</h2>
          </div>
          <span class="status-pill" [class.amber]="report.status === 'pending'" [class.green]="report.status === 'resolved'" [class.blue]="report.status === 'reviewing'">
            {{ getStatusLabel(report.status || '') }}
          </span>
        </div>

        <p class="detail-desc">{{ report.description }}</p>

        <div class="detail-meta">
          <div>
            <ion-icon name="calendar-outline"></ion-icon>
            <span>Fecha</span>
            <strong>{{ report.created_at | date:'medium' }}</strong>
          </div>
          <div>
            <ion-icon name="location-outline"></ion-icon>
            <span>Coordenadas</span>
            <strong>{{ report.latitude }}, {{ report.longitude }}</strong>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .modal-header ion-toolbar {
      --background: transparent;
      --border-width: 0;
    }

    .detail-content {
      --background: linear-gradient(145deg, rgba(238, 246, 244, 1) 0%, rgba(238, 243, 255, 1) 100%);
    }

    .detail-shell {
      padding: 18px;
    }

    .detail-img {
      width: 100%;
      height: 260px;
      border-radius: 26px;
      object-fit: cover;
      box-shadow: var(--app-shadow-md);
    }

    .detail-title-row {
      margin-top: 20px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .detail-title-row h2 {
      margin: 5px 0 0;
      color: var(--app-ink);
      font-size: 22px;
      font-weight: 950;
    }

    .detail-desc {
      margin: 16px 0;
      color: var(--app-ink-soft);
      font-size: 14px;
      line-height: 1.55;
    }

    .detail-meta {
      display: grid;
      gap: 10px;
    }

    .detail-meta div {
      min-height: 74px;
      border: 1px solid var(--app-line);
      border-radius: 20px;
      padding: 14px;
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: 10px;
      align-items: center;
      background: rgba(255, 255, 255, 0.76);
    }

    .detail-meta ion-icon {
      grid-row: 1 / span 2;
      color: var(--app-green);
      font-size: 22px;
    }

    .detail-meta span {
      color: var(--app-muted);
      font-size: 11px;
      font-weight: 850;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .detail-meta strong {
      min-width: 0;
      overflow-wrap: anywhere;
      color: var(--app-ink);
      font-size: 13px;
      font-weight: 800;
    }
  `]
})
export class ReportDetailModal {
  @Input() report!: Report;
  private modalCtrl = inject(ModalController);

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      reviewing: 'En revisión',
      resolved: 'Resuelto',
      rejected: 'Rechazado'
    };
    return labels[status] || status;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header class="ion-no-border app-page-header report-header">
      <ion-toolbar>
        <div class="app-toolbar-shell">
          <div class="app-toolbar-card">
            <div class="app-toolbar-copy">
              <span class="app-toolbar-eyebrow">Participación ciudadana</span>
              <div class="app-toolbar-title-row">
                <h1 class="app-toolbar-title">Reportes</h1>
                <span class="app-toolbar-chip">{{ reports.length }} en historial</span>
              </div>
            </div>
          </div>
        </div>
      </ion-toolbar>

      <ion-toolbar class="segment-toolbar">
        <div class="app-secondary-shell">
          <div class="app-secondary-card">
            <ion-segment [(ngModel)]="activeSegment" mode="ios" (ionChange)="segmentChanged()" class="custom-segment">
              <ion-segment-button value="new">
                <ion-label>Nuevo</ion-label>
              </ion-segment-button>
              <ion-segment-button value="history">
                <ion-label>Historial</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="report-content">
      <main class="app-shell report-shell">
        <section *ngIf="activeSegment === 'new'" class="report-flow animate-rise">
          <button type="button" class="photo-capture-card app-panel app-panel-strong" (click)="takePhoto()">
            @if (photoCaptured) {
              <img [src]="photoCaptured" class="captured-img" alt="Foto capturada">
              <span class="photo-action">
                <ion-icon name="camera"></ion-icon>
                Cambiar foto
              </span>
            } @else {
              <span class="capture-icon">
                <ion-icon name="camera-outline"></ion-icon>
              </span>
              <strong>Capturar evidencia</strong>
              <span>Toma una foto clara del punto a reportar.</span>
            }
          </button>

          <section class="report-form app-panel app-panel-strong">
            <div class="app-field">
              <label class="app-label">Ubicación del punto</label>
              <div class="map-wrapper">
                <div #reportMap class="mini-map"></div>
                <button class="map-recenter" type="button" (click)="getCurrentLocation()">
                  <ion-icon name="locate"></ion-icon>
                </button>
              </div>
            </div>

            <div class="app-field">
              <label class="app-label" for="problem-type">Tipo de problema</label>
              <div class="app-input-shell select-shell">
                <ion-icon name="warning-outline"></ion-icon>
                <select id="problem-type" [(ngModel)]="selectedType">
                  <option [ngValue]="null" disabled>Selecciona una opción</option>
                  @for (type of problemTypes; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
                <ion-icon name="chevron-down-outline"></ion-icon>
              </div>
            </div>

            <div class="app-field">
              <label class="app-label" for="report-description">Detalles del reporte</label>
              <div class="app-input-shell textarea-shell">
                <ion-icon name="document-text-outline"></ion-icon>
                <textarea
                  id="report-description"
                  [(ngModel)]="description"
                  rows="4"
                  placeholder="¿Qué está pasando?"></textarea>
              </div>
            </div>

            <button class="app-button submit-btn" type="button" (click)="submitReport()" [disabled]="!canSubmit() || submitting">
              <ion-icon name="send-outline" *ngIf="!submitting"></ion-icon>
              <ion-spinner name="crescent" *ngIf="submitting"></ion-spinner>
              <span>{{ submitting ? 'Enviando...' : 'Enviar reporte' }}</span>
            </button>
          </section>
        </section>

        <section *ngIf="activeSegment === 'history'" class="history-list animate-rise">
          @for (report of reports; track report.id) {
            <article class="history-card app-panel" (click)="showDetail(report)">
              <div class="history-img">
                <img [src]="report.photo_url" alt="Evidencia del reporte">
                <span class="status-pill" [class.amber]="report.status === 'pending'" [class.green]="report.status === 'resolved'" [class.blue]="report.status === 'reviewing'">
                  {{ getStatusLabel(report.status || '') }}
                </span>
              </div>

              <div class="history-body">
                <div class="history-meta">
                  <span>{{ report.created_at | date:'dd MMM, h:mm a' }}</span>
                  <button type="button" class="delete-btn" (click)="deleteReport(report.id!); $event.stopPropagation()">
                    <ion-icon name="trash-outline"></ion-icon>
                  </button>
                </div>
                <h2>{{ report.type }}</h2>
                <p>{{ report.description }}</p>
              </div>
            </article>
          } @empty {
            <div class="empty-history app-panel">
              <ion-icon name="albums-outline"></ion-icon>
              <strong>Sin reportes todavía</strong>
              <span>Cuando envíes un reporte aparecerá aquí con su estado.</span>
            </div>
          }
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    .report-header .app-toolbar-shell {
      padding-bottom: 8px;
    }

    .segment-toolbar {
      --background: transparent;
    }

    .custom-segment {
      --background: rgba(36, 55, 89, 0.07);
      border-radius: 16px;
      padding: 2px;
    }

    .custom-segment ion-segment-button {
      --border-radius: 13px;
      --color: var(--app-muted);
      --color-checked: var(--app-ink);
      --indicator-color: rgba(255, 255, 255, 0.98);
      min-height: 42px;
      font-weight: 850;
    }

    .report-shell {
      padding-top: 8px;
    }

    .report-flow,
    .history-list {
      display: grid;
      gap: 16px;
    }

    .photo-capture-card {
      width: 100%;
      min-height: 224px;
      overflow: hidden;
      padding: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-align: center;
      color: var(--app-ink);
    }

    .captured-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-action {
      position: absolute;
      right: 14px;
      bottom: 14px;
      min-height: 38px;
      border-radius: 14px;
      padding: 0 12px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(255, 255, 255, 0.92);
      color: var(--app-green-dark);
      font-size: 13px;
      font-weight: 850;
      box-shadow: var(--app-shadow-sm);
    }

    .capture-icon {
      width: 64px;
      height: 64px;
      border-radius: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      background: linear-gradient(135deg, var(--app-green), var(--app-blue));
      box-shadow: 0 16px 30px rgba(20, 143, 120, 0.24);
    }

    .capture-icon ion-icon {
      font-size: 30px;
    }

    .photo-capture-card strong {
      margin-top: 6px;
      font-size: 18px;
      font-weight: 950;
    }

    .photo-capture-card > span:not(.capture-icon):not(.photo-action) {
      max-width: 260px;
      color: var(--app-muted);
      font-size: 13px;
      line-height: 1.45;
    }

    .report-form {
      padding: 20px;
    }

    .map-wrapper {
      position: relative;
      height: 156px;
      overflow: hidden;
      border: 1px solid var(--app-line);
      border-radius: 22px;
      box-shadow: var(--app-shadow-sm);
    }

    .mini-map {
      width: 100%;
      height: 100%;
    }

    .map-recenter {
      position: absolute;
      right: 12px;
      bottom: 12px;
      z-index: 9999;
      width: 40px;
      height: 40px;
      border: 0;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      background: linear-gradient(135deg, var(--app-green), var(--app-blue));
      box-shadow: 0 12px 22px rgba(16, 35, 63, 0.18);
    }

    .select-shell select {
      appearance: none;
    }

    .select-shell ion-icon:last-child {
      margin-left: auto;
      color: var(--app-muted);
      pointer-events: none;
    }

    .textarea-shell {
      align-items: flex-start;
      min-height: 118px;
      padding-top: 14px;
    }

    .textarea-shell ion-icon {
      margin-top: 1px;
    }

    .textarea-shell textarea {
      min-height: 88px;
      resize: none;
      line-height: 1.45;
    }

    .submit-btn {
      width: 100%;
    }

    .history-card {
      overflow: hidden;
    }

    .history-img {
      position: relative;
      height: 172px;
      overflow: hidden;
      border-radius: 28px 28px 0 0;
    }

    .history-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .history-img .status-pill {
      position: absolute;
      top: 14px;
      left: 14px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .history-body {
      padding: 18px;
    }

    .history-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }

    .history-meta span {
      color: var(--app-muted);
      font-size: 11px;
      font-weight: 850;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .delete-btn {
      width: 36px;
      height: 36px;
      border: 0;
      border-radius: 13px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(232, 93, 88, 0.1);
      color: var(--app-coral);
      flex-shrink: 0;
    }

    .history-body h2 {
      margin: 0 0 7px;
      color: var(--app-ink);
      font-size: 18px;
      font-weight: 950;
    }

    .history-body p {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
      color: var(--app-ink-soft);
      font-size: 13px;
      line-height: 1.5;
    }

    .empty-history {
      min-height: 220px;
      padding: 26px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-align: center;
    }

    .empty-history ion-icon {
      width: 62px;
      height: 62px;
      border-radius: 22px;
      padding: 15px;
      color: var(--app-blue);
      background: rgba(30, 107, 214, 0.11);
    }

    .empty-history strong {
      color: var(--app-ink);
      font-size: 17px;
      font-weight: 950;
    }

    .empty-history span {
      max-width: 260px;
      color: var(--app-muted);
      font-size: 13px;
      line-height: 1.45;
    }
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

  ngOnInit() {
    this.loadMyReports();
  }

  ngAfterViewInit() {
    if (this.activeSegment === 'new') setTimeout(() => this.initMap(), 500);
  }

  segmentChanged() {
    if (this.activeSegment === 'new') {
      setTimeout(() => {
        this.initMap();
      }, 100);
      return;
    }

    this.destroyMap();
    this.loadMyReports();
  }

  private destroyMap() {
    if (this.map) {
      this.marker = null;
      this.map.remove();
      this.map = null;
    }
  }

  private initMap() {
    if (!this.mapContainer?.nativeElement) return;

    if (this.map) {
      this.destroyMap();
    }

    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="background: linear-gradient(135deg, #148f78, #1e6bd6); width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 8px 18px rgba(16,35,63,0.25);">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34]
    });

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.latitude, this.longitude],
      zoom: 16,
      zoomControl: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.marker = L.marker([this.latitude, this.longitude], {
      draggable: true,
      icon: customIcon
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const pos = this.marker!.getLatLng();
      this.latitude = pos.lat;
      this.longitude = pos.lng;
    });

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
    } catch (e) {
      this.showToast('No se pudo obtener la ubicación exacta', 'warning');
    }
  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        promptLabelHeader: 'Capturar foto',
        promptLabelCancel: 'Cancelar'
      });
      this.photoCaptured = image.dataUrl || null;
    } catch (e) {
      console.log('Captura cancelada');
    }
  }

  canSubmit() {
    return this.photoCaptured && this.selectedType && this.description.trim().length >= 5;
  }

  async submitReport() {
    if (!this.canSubmit()) return;

    this.submitting = true;
    const loading = await this.loadingCtrl.create({ message: 'Enviando...' });
    await loading.present();

    const newReport = {
      type: this.selectedType!,
      description: this.description.trim(),
      photo_url: this.photoCaptured!,
      latitude: this.latitude,
      longitude: this.longitude
    };

    this.reportService.createReport(newReport).subscribe({
      next: () => {
        loading.dismiss();
        this.submitting = false;
        this.showToast('Reporte enviado', 'success');
        this.resetForm();
        this.activeSegment = 'history';
        this.loadMyReports();
      },
      error: () => {
        loading.dismiss();
        this.submitting = false;
        this.showToast('Error de servidor', 'danger');
      }
    });
  }

  loadMyReports() {
    this.reportService.getUserReports().subscribe({
      next: (res: any) => {
        this.reports = res.data || res;
      },
      error: () => this.showToast('Error al cargar historial', 'danger')
    });
  }

  async deleteReport(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar reporte',
      message: '¿Quieres borrar este reporte?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí',
          handler: () => {
            this.reportService.deleteReport(id).subscribe(() => {
              this.showToast('Eliminado', 'success');
              this.loadMyReports();
            });
          }
        }
      ]
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
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      reviewing: 'Revisando',
      resolved: 'Resuelto',
      rejected: 'Rechazado'
    };
    return labels[status] || status;
  }

  resetForm() {
    this.photoCaptured = null;
    this.selectedType = null;
    this.description = '';
  }

  async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 2000, position: 'bottom' });
    t.present();
  }
}
