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
        <ion-title>Detalles del Reporte</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()" class="close-btn">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="detail-content">
      <div class="detail-container">
        <div class="detail-hero">
          <img [src]="report.photo_url" class="hero-img" alt="Evidencia">
          <div class="hero-overlay">
            <span class="status-badge" [class.amber]="report.status === 'pending'" [class.green]="report.status === 'resolved'" [class.blue]="report.status === 'reviewing'">
              {{ getStatusLabel(report.status || '') }}
            </span>
          </div>
        </div>

        <div class="detail-body animate-rise">
          <div class="header-section">
            <span class="category-tag">{{ report.type }}</span>
            <h1 class="report-title">Reporte ciudadano</h1>
            <p class="report-description">{{ report.description }}</p>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <ion-icon name="calendar-clear-outline" class="card-icon"></ion-icon>
              <div class="card-text">
                <span class="label">REGISTRADO EL</span>
                <span class="value">{{ report.created_at | date:'dd MMM, yyyy' }}</span>
                <span class="sub-value">{{ report.created_at | date:'hh:mm a' }}</span>
              </div>
            </div>

            <div class="info-card">
              <ion-icon name="location-outline" class="card-icon"></ion-icon>
              <div class="card-text">
                <span class="label">UBICACIÓN GPS</span>
                <span class="value">{{ report.latitude | number:'1.4-4' }}, {{ report.longitude | number:'1.4-4' }}</span>
              </div>
            </div>
          </div>

          <div class="map-section">
            <div class="section-header">
              <ion-icon name="map-outline"></ion-icon>
              <span>Ubicación en mapa</span>
            </div>
            <div class="detail-map-wrapper">
              <div #detailMap class="detail-mini-map"></div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .modal-header ion-toolbar {
      --background: #ffffff;
      --color: var(--app-ink);
      --padding-top: 8px;
      --padding-bottom: 8px;
    }
    ion-title { font-weight: 900; font-size: 16px; }
    .close-btn { --color: var(--app-ink-soft); font-size: 24px; }
    .detail-content { --background: #f4f7f6; }
    .detail-hero { position: relative; width: 100%; height: 260px; overflow: hidden; }
    .hero-img { width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 40%); padding: 20px; display: flex; align-items: flex-end; justify-content: flex-end; }
    .status-badge { padding: 6px 16px; border-radius: 99px; background: #ffffff; font-size: 11px; font-weight: 900; text-transform: uppercase; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
    .status-badge.amber { color: #d58013; }
    .status-badge.green { color: #148f78; }
    .status-badge.blue { color: #1e6bd6; }
    .detail-body { background: #f4f7f6; border-radius: 32px 32px 0 0; margin-top: -30px; padding: 24px 20px; position: relative; z-index: 10; display: grid; gap: 24px; }
    .category-tag { display: inline-block; padding: 4px 12px; background: rgba(20, 143, 120, 0.1); color: #148f78; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
    .report-title { margin: 0 0 10px; font-size: 24px; font-weight: 950; color: var(--app-ink); }
    .report-description { margin: 0; color: var(--app-ink-soft); font-size: 15px; line-height: 1.6; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-card { background: #ffffff; padding: 16px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 10px; }
    .card-icon { font-size: 20px; color: #148f78; }
    .card-text { display: flex; flex-direction: column; }
    .label { font-size: 9px; font-weight: 800; color: var(--app-muted); letter-spacing: 0.06em; }
    .value { font-size: 13px; font-weight: 800; color: var(--app-ink); }
    .sub-value { font-size: 11px; color: var(--app-muted); }
    .section-header { display: flex; align-items: center; gap: 8px; color: var(--app-ink); font-weight: 850; font-size: 14px; margin-bottom: 12px; }
    .detail-map-wrapper { width: 100%; height: 160px; border-radius: 24px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); }
    .detail-mini-map { width: 100%; height: 100%; }
  `]
})
export class ReportDetailModal implements AfterViewInit {
  @Input() report!: Report;
  @ViewChild('detailMap') mapContainer!: ElementRef;
  
  private modalCtrl = inject(ModalController);

  ngAfterViewInit() {
    setTimeout(() => this.initMiniMap(), 400);
  }

  private initMiniMap() {
    if (!this.mapContainer?.nativeElement) return;
    
    const lat = Number(this.report.latitude);
    const lng = Number(this.report.longitude);

    const map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const customIcon = L.divIcon({
      className: 'detail-marker',
      html: `<div style="background: var(--app-green); width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);
  }

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

            <!-- Selector de Tipo Elegante -->
            <div class="app-field">
              <label class="app-label">¿Cuál es el problema?</label>
              <div class="custom-dropdown-trigger" (click)="openTypeSelector()">
                <div class="trigger-content">
                  <ion-icon [name]="getSelectedTypeIcon()" class="type-icon" [style.color]="getSelectedTypeColor()"></ion-icon>
                  <span [class.placeholder]="!selectedType">
                    {{ selectedType || 'Selecciona el tipo de reporte' }}
                  </span>
                </div>
                <ion-icon name="chevron-down-outline" class="chevron"></ion-icon>
              </div>
            </div>

            <div class="app-field">
              <label class="app-label" for="report-description">Detalles adicionales</label>
              <div class="app-input-shell textarea-shell">
                <ion-icon name="document-text-outline"></ion-icon>
                <textarea
                  id="report-description"
                  [(ngModel)]="description"
                  rows="4"
                  placeholder="Describe brevemente lo observado..."></textarea>
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

      <!-- MODAL SELECTOR DE TIPOS (BOTTOM SHEET) -->
      <ion-modal #typeModal [isOpen]="isTypeModalOpen" (didDismiss)="isTypeModalOpen = false" [initialBreakpoint]="0.65" [breakpoints]="[0, 0.65, 0.9]">
        <ng-template>
          <ion-header class="ion-no-border">
            <ion-toolbar>
              <ion-title>Tipo de Reporte</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding-bottom">
            <div class="type-list">
              @for (type of problemTypes; track type.id) {
                <button class="type-option" (click)="selectType(type.id)" [class.selected]="selectedType === type.id">
                  <div class="option-icon" [style.background-color]="type.color + '15'" [style.color]="type.color">
                    <ion-icon [name]="type.icon"></ion-icon>
                  </div>
                  <span class="option-label">{{ type.id }}</span>
                  <ion-icon name="checkmark-circle" class="option-check" *ngIf="selectedType === type.id"></ion-icon>
                </button>
              }
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .report-header .app-toolbar-shell {
      padding-bottom: 8px;
    }

    .segment-toolbar {
      --background: transparent;
      --padding-start: 0;
      --padding-end: 0;
    }

    .app-secondary-shell {
      width: 100%;
    }

    .app-secondary-card {
      width: 100%;
      background: #ffffff;
      border-radius: 20px;
      padding: 6px;
      box-shadow: var(--app-shadow-sm);
    }

    .custom-segment {
      --background: rgba(36, 55, 89, 0.05);
      border-radius: 14px;
      padding: 2px;
      width: 100%;
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
      display: grid;
      gap: 18px;
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

    /* Estilos del Custom Dropdown */
    .custom-dropdown-trigger {
      min-height: 54px;
      background: #ffffff;
      border: 1px solid var(--app-line);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      transition: all 0.2s ease;
    }
    .custom-dropdown-trigger:active { transform: scale(0.98); background: #f9f9f9; }
    .trigger-content { display: flex; align-items: center; gap: 12px; }
    .type-icon { font-size: 22px; }
    .trigger-content span { font-weight: 750; color: var(--app-ink); font-size: 14px; }
    .trigger-content .placeholder { color: var(--app-muted); font-weight: 600; }
    .chevron { font-size: 18px; color: var(--app-muted); }

    /* Estilos del Modal de Tipos */
    ion-modal::part(content) { border-radius: 32px 32px 0 0; }
    .type-list { padding: 10px 16px 30px; display: grid; gap: 8px; }
    .type-option {
      width: 100%;
      min-height: 62px;
      background: #fff;
      border: 1px solid #f2f4f3;
      border-radius: 18px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 16px;
      text-align: left;
    }
    .type-option.selected { border-color: var(--app-green); background: rgba(20, 143, 120, 0.04); }
    .option-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .option-label { flex: 1; font-weight: 850; color: var(--app-ink); font-size: 14px; }
    .option-check { color: var(--app-green); font-size: 22px; }

    .textarea-shell {
      align-items: flex-start;
      min-height: 118px;
      padding-top: 14px;
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
  isTypeModalOpen = false;
  reports: Report[] = [];
  isLoading = false;

  latitude: number = 2.9273;
  longitude: number = -75.2819;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  problemTypes = [
    { id: 'Basura acumulada', icon: 'trash-outline', color: '#E85D58' },
    { id: 'Camión no pasó', icon: 'bus-outline', color: '#1E6BD6' },
    { id: 'Contenedor dañado', icon: 'construct-outline', color: '#F5A623' },
    { id: 'Contenedor rebosado', icon: 'layers-outline', color: '#FF8C00' },
    { id: 'Punto ilegal de residuos', icon: 'warning-outline', color: '#148F78' },
    { id: 'Animal muerto', icon: 'paw-outline', color: '#8B4513' },
    { id: 'Escombros en vía', icon: 'cube-outline', color: '#708090' },
    { id: 'Quema de basura', icon: 'flame-outline', color: '#FF4500' },
    { id: 'Alcantarilla obstruida', icon: 'water-outline', color: '#00CED1' },
    { id: 'Falta de barrido', icon: 'leaf-outline', color: '#228B22' },
    { id: 'Otros', icon: 'ellipsis-horizontal-outline', color: '#666666' }
  ];

  ngOnInit() {
    this.loadMyReports();
  }

  ionViewWillEnter() {
    // Forzar limpieza y recarga al entrar para evitar datos de usuarios anteriores
    this.reports = [];
    this.loadMyReports();
  }

  ngAfterViewInit() {
    if (this.activeSegment === 'new') setTimeout(() => this.initMap(), 500);
  }

  openTypeSelector() {
    this.isTypeModalOpen = true;
  }

  selectType(typeId: string) {
    this.selectedType = typeId;
    this.isTypeModalOpen = false;
  }

  getSelectedTypeIcon() {
    const type = this.problemTypes.find(t => t.id === this.selectedType);
    return type ? type.icon : 'help-circle-outline';
  }

  getSelectedTypeColor() {
    const type = this.problemTypes.find(t => t.id === this.selectedType);
    return type ? type.color : '#7a8798';
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
