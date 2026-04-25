import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import * as L from 'leaflet';
import { FleetService, Vehicle } from '../../services/fleet.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule],
  template: `
    <ion-header [translucent]="true" class="page-header app-page-header">
      <ion-toolbar>
        <div class="app-toolbar-shell">
          <div class="app-toolbar-card">
            <div class="app-toolbar-copy">
              <span class="app-toolbar-eyebrow">Monitoreo</span>
              <div class="app-toolbar-title-row">
                <h1 class="app-toolbar-title">Rastreo en vivo</h1>
                <span class="app-toolbar-chip">{{ activeTrucksCount }} en ruta</span>
              </div>
            </div>

            <div class="app-toolbar-actions">
              <button class="app-toolbar-icon-button emphasis" type="button" (click)="getCurrentLocation()">
                <ion-icon name="locate-outline"></ion-icon>
              </button>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="map-content">
      <div #mapContainer class="map-container"></div>

      <section class="map-status app-panel animate-rise">
        <div class="status-block">
          <span>{{ nearbyTrucks.length }}</span>
          <strong>Unidades</strong>
        </div>
        <div class="status-divider"></div>
        <div class="status-block">
          <span>{{ activeTrucksCount }}</span>
          <strong>Activas</strong>
        </div>
        <button class="locate-fab" type="button" (click)="getCurrentLocation()">
          <ion-icon name="locate"></ion-icon>
        </button>
      </section>

      <section class="signal-note app-panel animate-fade" *ngIf="!selectedTruck">
        <ion-icon name="radio-outline"></ion-icon>
        <div>
          <strong>Señal de flota</strong>
          <span>Actualización automática cada 10 segundos</span>
        </div>
      </section>

      @if (selectedTruck) {
        <section class="truck-sheet app-panel app-panel-strong animate-rise">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <div class="truck-identity">
              <div class="truck-icon">
                <ion-icon name="bus-outline"></ion-icon>
              </div>
              <div class="truck-copy">
                <strong>{{ selectedTruck.plate }}</strong>
                <span>{{ selectedTruck.driver_name }}</span>
              </div>
            </div>
            <span class="status-pill" [class.green]="selectedTruck.status === 'active'" [class.amber]="selectedTruck.status !== 'active'">
              {{ selectedTruck.status === 'active' ? 'Operando' : 'Pausado' }}
            </span>
          </div>

          <div class="truck-metrics">
            <div>
              <span>Distancia</span>
              <strong>{{ selectedTruck.distance || 0 }}m</strong>
            </div>
            <div>
              <span>ETA</span>
              <strong>{{ (selectedTruck.distance || 0) / 333 | number:'1.0-0' }} min</strong>
            </div>
            <div>
              <span>Carga</span>
              <strong>85%</strong>
            </div>
          </div>

          <div class="sheet-actions">
            <button class="app-button" type="button" (click)="selectTruck(selectedTruck)">
              <ion-icon name="navigate-outline"></ion-icon>
              Centrar unidad
            </button>
            <button class="app-muted-button" type="button" (click)="selectedTruck = null">
              Ver flota
            </button>
          </div>
        </section>
      } @else {
        <section class="fleet-dock">
          <div class="fleet-title-row">
            <strong>Unidades en zona</strong>
            <span>{{ nearbyTrucks.length }} disponibles</span>
          </div>

          <div class="fleet-scroller">
            @for (truck of nearbyTrucks; track truck.id) {
              <button type="button" class="fleet-card app-panel" (click)="selectTruck(truck)">
                <span class="fleet-status" [class.online]="truck.status === 'active'"></span>
                <span class="fleet-icon"><ion-icon name="bus-outline"></ion-icon></span>
                <span class="fleet-copy">
                  <strong>{{ truck.plate }}</strong>
                  <small>{{ truck.distance }}m</small>
                </span>
                <ion-icon name="chevron-forward-outline" class="fleet-arrow"></ion-icon>
              </button>
            } @empty {
              <div class="empty-fleet app-panel">
                <ion-icon name="trail-sign-outline"></ion-icon>
                <span>No hay unidades cercanas en este momento.</span>
              </div>
            }
          </div>
        </section>
      }
    </ion-content>
  `,
  styles: [`
    .page-header .app-toolbar-shell {
      padding-bottom: 8px;
    }

    .map-content {
      --background: var(--app-bg);
    }

    .map-container {
      width: 100%;
      height: 100%;
      z-index: 1;
      filter: saturate(0.92) contrast(0.98);
    }

    .map-status {
      position: absolute;
      top: 104px;
      left: 16px;
      right: 16px;
      z-index: 10;
      min-height: 72px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .status-block {
      min-width: 76px;
      display: grid;
      gap: 2px;
    }

    .status-block span {
      color: var(--app-ink);
      font-size: 21px;
      font-weight: 950;
      line-height: 1;
    }

    .status-block strong {
      color: var(--app-muted);
      font-size: 10px;
      font-weight: 850;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .status-divider {
      width: 1px;
      height: 34px;
      background: var(--app-line-strong);
    }

    .locate-fab {
      width: 44px;
      height: 44px;
      margin-left: auto;
      border: 0;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      background: linear-gradient(135deg, var(--app-green) 0%, var(--app-blue) 100%);
      box-shadow: 0 14px 24px rgba(20, 143, 120, 0.22);
    }

    .locate-fab ion-icon {
      font-size: 21px;
    }

    .signal-note {
      position: absolute;
      top: 188px;
      left: 16px;
      z-index: 10;
      max-width: calc(100% - 32px);
      padding: 10px 13px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .signal-note ion-icon {
      width: 34px;
      height: 34px;
      border-radius: 13px;
      padding: 7px;
      color: var(--app-green-dark);
      background: rgba(20, 143, 120, 0.12);
    }

    .signal-note strong,
    .signal-note span {
      display: block;
    }

    .signal-note strong {
      color: var(--app-ink);
      font-size: 12px;
      font-weight: 900;
    }

    .signal-note span {
      margin-top: 2px;
      color: var(--app-muted);
      font-size: 11px;
      font-weight: 650;
    }

    .truck-sheet {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 104px;
      z-index: 20;
      padding: 22px;
    }

    .sheet-handle {
      width: 44px;
      height: 4px;
      margin: -8px auto 18px;
      border-radius: 999px;
      background: rgba(81, 97, 121, 0.18);
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }

    .truck-identity {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .truck-icon {
      width: 50px;
      height: 50px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      background: linear-gradient(135deg, var(--app-green), var(--app-blue));
      box-shadow: 0 14px 24px rgba(20, 143, 120, 0.22);
      flex-shrink: 0;
    }

    .truck-icon ion-icon {
      font-size: 24px;
    }

    .truck-copy {
      min-width: 0;
      display: grid;
      gap: 2px;
    }

    .truck-copy strong {
      color: var(--app-ink);
      font-size: 20px;
      font-weight: 950;
    }

    .truck-copy span {
      overflow: hidden;
      color: var(--app-muted);
      font-size: 13px;
      font-weight: 650;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .truck-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 18px;
    }

    .truck-metrics div {
      min-height: 72px;
      border-radius: 18px;
      padding: 12px 8px;
      display: grid;
      align-content: center;
      gap: 5px;
      text-align: center;
      background: linear-gradient(135deg, rgba(20, 143, 120, 0.08), rgba(30, 107, 214, 0.07));
    }

    .truck-metrics span {
      color: var(--app-muted);
      font-size: 10px;
      font-weight: 850;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .truck-metrics strong {
      color: var(--app-ink);
      font-size: 17px;
      font-weight: 950;
    }

    .sheet-actions {
      display: grid;
      grid-template-columns: 1fr 0.76fr;
      gap: 10px;
    }

    .sheet-actions button {
      width: 100%;
    }

    .fleet-dock {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 104px;
      z-index: 10;
    }

    .fleet-title-row {
      padding: 0 18px 10px;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      color: var(--app-ink);
      text-shadow: 0 1px 8px rgba(255, 255, 255, 0.9);
    }

    .fleet-title-row strong {
      font-size: 15px;
      font-weight: 950;
    }

    .fleet-title-row span {
      color: var(--app-green-dark);
      font-size: 11px;
      font-weight: 850;
    }

    .fleet-scroller {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding: 0 18px 8px;
      scrollbar-width: none;
    }

    .fleet-scroller::-webkit-scrollbar {
      display: none;
    }

    .fleet-card {
      position: relative;
      min-width: 176px;
      min-height: 78px;
      border-radius: 22px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 11px;
      text-align: left;
    }

    .fleet-status {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(81, 97, 121, 0.34);
    }

    .fleet-status.online {
      background: var(--app-green);
      animation: app-pulse 2s infinite;
    }

    .fleet-icon {
      width: 42px;
      height: 42px;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--app-green-dark);
      background: rgba(20, 143, 120, 0.12);
      flex-shrink: 0;
    }

    .fleet-copy {
      min-width: 0;
      display: grid;
      gap: 3px;
      flex: 1;
    }

    .fleet-copy strong {
      color: var(--app-ink);
      font-size: 14px;
      font-weight: 950;
    }

    .fleet-copy small {
      color: var(--app-green-dark);
      font-size: 11px;
      font-weight: 800;
    }

    .fleet-arrow {
      color: rgba(81, 97, 121, 0.42);
      font-size: 16px;
      flex-shrink: 0;
    }

    .empty-fleet {
      min-width: calc(100vw - 36px);
      min-height: 92px;
      padding: 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--app-muted);
      font-size: 13px;
      font-weight: 700;
    }

    .empty-fleet ion-icon {
      color: var(--app-amber);
      font-size: 24px;
    }
  `]
})
export class MapPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private fleetService = inject(FleetService);
  private map: L.Map | null = null;
  private userMarker: L.Marker | null = null;
  private truckMarkers: Map<string, L.Marker> = new Map();
  private refreshInterval: any;

  nearbyTrucks: Vehicle[] = [];
  selectedTruck: Vehicle | null = null;
  userCoords: { lat: number, lng: number } = { lat: 2.9273, lng: -75.2819 };

  get activeTrucksCount(): number {
    return this.nearbyTrucks.filter(t => t.status === 'active').length;
  }

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 300);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  ionViewDidEnter() {
    if (this.map) this.map.invalidateSize();
  }

  private initMap(): void {
    if (this.map) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.userCoords.lat, this.userCoords.lng],
      zoom: 15,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OSM'
    }).addTo(this.map);

    const userIcon = L.divIcon({
      className: 'user-location-icon',
      html: '<div style="background: #1e6bd6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(16,35,63,0.35);"></div>',
      iconSize: [16, 16]
    });

    this.userMarker = L.marker([this.userCoords.lat, this.userCoords.lng], { icon: userIcon }).addTo(this.map);

    this.loadRealData();
    this.getCurrentLocation();

    this.refreshInterval = setInterval(() => this.loadRealData(), 10000);
  }

  private loadRealData() {
    this.fleetService.getActiveVehicles().subscribe({
      next: (vehicles) => {
        this.nearbyTrucks = vehicles.map(v => ({
          ...v,
          distance: this.calculateDistance(this.userCoords.lat, this.userCoords.lng, Number(v.latitude), Number(v.longitude))
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        this.updateMarkers();
      }
    });
  }

  private updateMarkers() {
    if (!this.map) return;

    const truckIconHtml = (color: string) => `
      <div style="background: ${color}; width: 34px; height: 34px; border-radius: 13px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 8px 18px rgba(16,35,63,0.24);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width: 17px; height: 17px;">
          <path d="M3 7h13v8H3z"></path>
          <path d="M16 10h3l2 3v2h-5z"></path>
          <circle cx="7" cy="17" r="2"></circle>
          <circle cx="18" cy="17" r="2"></circle>
        </svg>
      </div>
    `;

    this.nearbyTrucks.forEach(truck => {
      const color = truck.status === 'active' ? '#148f78' : '#7a8798';
      const icon = L.divIcon({
        className: 'truck-map-icon',
        html: truckIconHtml(color),
        iconSize: [34, 34]
      });

      const coords: L.LatLngExpression = [Number(truck.latitude), Number(truck.longitude)];

      if (this.truckMarkers.has(truck.id)) {
        this.truckMarkers.get(truck.id)!.setLatLng(coords);
      } else {
        const marker = L.marker(coords, { icon }).addTo(this.map!);
        marker.bindPopup(`<b>${truck.plate}</b><br>${truck.driver_name}`);
        this.truckMarkers.set(truck.id, marker);
      }
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  public getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
        this.userMarker?.setLatLng([this.userCoords.lat, this.userCoords.lng]);
        this.map?.setView([this.userCoords.lat, this.userCoords.lng], 15);
        this.loadRealData();
      });
    }
  }

  selectTruck(truck: Vehicle) {
    this.selectedTruck = truck;
    if (this.map) {
      this.map.flyTo([Number(truck.latitude), Number(truck.longitude)], 16);
      this.truckMarkers.get(truck.id)?.openPopup();
    }
  }
}
