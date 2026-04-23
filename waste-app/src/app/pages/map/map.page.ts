import { Component, OnInit, inject, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import * as L from 'leaflet';
import { FleetService, Vehicle } from '../../services/fleet.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule],
  template: `
    <ion-header [translucent]="true" class="page-header">
      <ion-toolbar>
        <div class="header-content">
          <span class="header-title">Rastreo en vivo</span>
          <button class="icon-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="map-content">
      <div #mapContainer class="map-container"></div>

      <!-- Fleet Overview Header -->
      <div class="fleet-overview-header shadow-premium animate-down">
        <div class="fleet-summary">
          <div class="summary-item">
            <span class="sum-val">{{ nearbyTrucks.length }}</span>
            <span class="sum-lab">Activos</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-item">
            <span class="sum-val">{{ activeTrucksCount }}</span>
            <span class="sum-lab">En Ruta</span>
          </div>
        </div>
        <button class="recenter-btn gradient-primary shadow-premium" (click)="getCurrentLocation()">
          <ion-icon name="locate"></ion-icon>
        </button>
      </div>

      <!-- Floating Stats Widget -->
      <div class="stats-widget shadow-premium animate-fade" *ngIf="!selectedTruck">
        <div class="widget-icon">📡</div>
        <div class="widget-content">
          <span class="w-title">Monitoreo Satelital</span>
          <span class="w-desc">Actualizando cada 10s</span>
        </div>
      </div>

      <!-- Elegant Bottom Sheet for Truck Detail -->
      @if (selectedTruck) {
        <div class="truck-sheet animate-up">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <div class="truck-identity">
              <div class="truck-icon-box gradient-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M3 4h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                </svg>
              </div>
              <div class="truck-meta">
                <span class="truck-plate">{{ selectedTruck.plate }}</span>
                <span class="truck-driver">{{ selectedTruck.driver_name }}</span>
              </div>
            </div>
            <div class="truck-status-badge" [class]="selectedTruck.status">
              {{ selectedTruck.status === 'active' ? 'Operando' : 'Mantenimiento' }}
            </div>
          </div>

          <div class="truck-stats-grid">
            <div class="t-stat">
              <span class="t-label">Distancia</span>
              <span class="t-value">{{ selectedTruck.distance || 0 }}m</span>
            </div>
            <div class="t-stat">
              <span class="t-label">ETA</span>
              <span class="t-value">{{ (selectedTruck.distance || 0) / 333 | number:'1.0-0' }} min</span>
            </div>
            <div class="t-stat">
              <span class="t-label">Carga</span>
              <span class="t-value">85%</span>
            </div>
          </div>

          <div class="sheet-actions">
            <button class="btn-action primary" (click)="selectTruck(selectedTruck)">Optimizar Ruta</button>
            <button class="btn-action secondary" (click)="selectedTruck = null">Ver flota</button>
          </div>
        </div>
      }

      <!-- Horizontal Fleet Scroller -->
      <div class="fleet-scroller-container" *ngIf="!selectedTruck">
        <div class="scroller-header">
          <span class="scroller-title">Unidades en Zona</span>
          <span class="scroller-more">Ver todas</span>
        </div>
        <div class="fleet-scroller">
          @for (truck of nearbyTrucks; track truck.id) {
            <div class="fleet-card shadow-premium" (click)="selectTruck(truck)">
              <div class="card-status-dot" [class.online]="truck.status === 'active'"></div>
              <div class="card-icon">🚛</div>
              <div class="card-info">
                <span class="c-plate">{{ truck.plate }}</span>
                <span class="c-dist">{{ truck.distance }}m</span>
              </div>
              <ion-icon name="chevron-forward-outline" class="card-arrow"></ion-icon>
            </div>
          } @empty {
            <div class="empty-fleet-card">
              <p>No hay unidades cercanas en este momento</p>
            </div>
          }
        </div>
      </div>
    </ion-content>
    `,
    styles: [`
    .map-container { height: 100%; width: 100%; z-index: 1; }

    .fleet-overview-header {
      position: absolute; top: 50px; left: 16px; right: 16px; z-index: 10;
      background: white; border-radius: 20px; padding: 12px 16px;
      display: flex; justify-content: space-between; align-items: center;

      .fleet-summary {
        display: flex; align-items: center; gap: 16px;
        .summary-item {
          display: flex; flex-direction: column;
          .sum-val { font-size: 16px; font-weight: 800; color: var(--app-text-main); }
          .sum-lab { font-size: 10px; color: var(--app-text-muted); font-weight: 700; text-transform: uppercase; }
        }
        .summary-divider { width: 1px; height: 24px; background: #e2e8f0; }
      }

      .recenter-btn {
        width: 42px; height: 42px; border-radius: 14px; border: none;
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 20px;
      }
    }

    .stats-widget {
      position: absolute; top: 125px; left: 16px; z-index: 10;
      background: white; border-radius: 14px; padding: 10px 14px;
      display: flex; align-items: center; gap: 12px;
      .widget-icon { font-size: 18px; }
      .w-title { display: block; font-size: 11px; font-weight: 800; color: var(--app-text-main); }
      .w-desc { font-size: 10px; color: #1D9E75; font-weight: 600; }
    }

    .truck-sheet {
      position: absolute; bottom: 85px; left: 16px; right: 16px; z-index: 20;
      background: white; border-radius: 28px; padding: 24px;
      box-shadow: 0 15px 50px rgba(0,0,0,0.2);
      .sheet-handle { width: 40px; height: 4px; background: #f1f5f9; border-radius: 10px; margin: -12px auto 16px; }
    }

    .sheet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .truck-identity {
      display: flex; align-items: center; gap: 16px;
      .truck-icon-box { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; svg { width: 24px; } }
      .truck-meta { display: flex; flex-direction: column; .truck-plate { font-size: 20px; font-weight: 800; color: var(--app-text-main); } .truck-driver { font-size: 13px; color: var(--app-text-muted); } }
    }
    .truck-status-badge { font-size: 11px; font-weight: 800; padding: 6px 12px; border-radius: 10px; &.active { background: #ecfdf5; color: #059669; } }

    .truck-stats-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); background: #f8fafc; border-radius: 20px; padding: 16px; margin-bottom: 24px;
      .t-stat { text-align: center; display: flex; flex-direction: column; gap: 4px; &:not(:last-child) { border-right: 1px solid #e2e8f0; } .t-label { font-size: 11px; color: var(--app-text-muted); font-weight: 600; text-transform: uppercase; } .t-value { font-size: 16px; font-weight: 700; color: var(--app-text-main); } }
    }

    .sheet-actions { display: flex; gap: 12px; .btn-action { flex: 1; height: 52px; border-radius: 16px; border: none; font-weight: 700; &.primary { background: #1D9E75; color: white; } &.secondary { background: #f1f5f9; color: #64748b; } } }

    .fleet-scroller-container {
      position: absolute; bottom: 85px; left: 0; right: 0; z-index: 10;
      .scroller-header { padding: 0 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: baseline; .scroller-title { color: var(--app-text-main); font-weight: 800; font-size: 14px; text-shadow: 0 1px 4px white; } .scroller-more { font-size: 11px; font-weight: 700; color: #1D9E75; } }
    }

    .fleet-scroller { display: flex; gap: 12px; padding: 0 20px 10px; overflow-x: auto; &::-webkit-scrollbar { display: none; } }
    .fleet-card {
      min-width: 160px; background: white; padding: 14px; border-radius: 22px; display: flex; align-items: center; gap: 12px; position: relative;
      .card-status-dot { position: absolute; top: 12px; right: 12px; width: 6px; height: 6px; border-radius: 50%; background: #cbd5e1; &.online { background: #1D9E75; box-shadow: 0 0 6px rgba(29, 158, 117, 0.4); } }
      .card-icon { font-size: 20px; }
      .card-info { display: flex; flex-direction: column; .c-plate { font-size: 14px; font-weight: 800; color: var(--app-text-main); } .c-dist { font-size: 11px; color: #1D9E75; font-weight: 600; } }
      .card-arrow { font-size: 14px; color: #cbd5e1; margin-left: auto; }
    }

    .animate-down { animation: slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .animate-up { animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .animate-fade { animation: fadeIn 0.8s ease-out; }
    @keyframes slideDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
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
      html: '<div style="background: #185FA5; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
      iconSize: [15, 15]
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

        if (!this.selectedTruck && this.nearbyTrucks.length > 0) {
          this.selectedTruck = this.nearbyTrucks[0];
        }

        this.updateMarkers();
      }
    });
  }

  private updateMarkers() {
    if (!this.map) return;

    const truckIconHtml = (color: string) => `
      <div style="background: ${color}; width: 30px; height: 30px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
          <path d="M3 4h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
        </svg>
      </div>
    `;

    this.nearbyTrucks.forEach(truck => {
      const color = truck.status === 'active' ? '#1D9E75' : '#888';
      const icon = L.divIcon({
        className: 'truck-map-icon',
        html: truckIconHtml(color),
        iconSize: [30, 30]
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
