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

      @if (selectedTruck) {
        <div class="truck-info-card">
          <div class="truck-header">
            <span class="truck-plate">{{ selectedTruck.plate }}</span>
            <span class="truck-status" [class]="selectedTruck.status">
              {{ selectedTruck.status === 'active' ? 'En camino' : 'Fuera de servicio' }}
            </span>
          </div>
          <div class="truck-details">
            <div class="detail-item">
              <span class="detail-label">Llegada estimada</span>
              <span class="detail-value">{{ (selectedTruck.distance || 0) / 80 | number:'1.0-0' }} min</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Conductor</span>
              <span class="detail-value">{{ selectedTruck.driver_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Distancia</span>
              <span class="detail-value">{{ selectedTruck.distance || 0 }} m</span>
            </div>
          </div>
        </div>
      }

      <div class="nearby-trucks">
        <h3 class="section-title">Camiones en operación</h3>
        <div class="truck-list">
          @for (truck of nearbyTrucks; track truck.id) {
            <div class="truck-item" (click)="selectTruck(truck)">
              <div class="truck-icon" [class]="truck.status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
                </svg>
              </div>
              <div class="truck-info">
                <span class="truck-plates">{{ truck.plate }}</span>
                <span class="truck-driver">{{ truck.driver_name }}</span>
              </div>
              <span class="truck-distance">{{ truck.distance || 0 }}m</span>
            </div>
          } @empty {
            <div class="ion-padding ion-text-center">
              <p>No hay camiones en operación en este momento.</p>
            </div>
          }
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page-header {
      ion-toolbar {
        --background: white;
        --border-width: 0 0 1px 0;
        --border-color: #ebebeb;
        color: #1a1a1a;
      }
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      color: #1a1a1a;
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .map-container {
      height: 45vh;
      width: 100%;
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #f0f0ed;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      svg {
        width: 18px;
        height: 18px;
        color: #666;
      }
    }

    .map-content {
      --background: #f9f9f7;
    }

    .truck-info-card {
      background: white;
      border-radius: 16px 16px 0 0;
      padding: 16px;
      margin-top: -16px;
      position: relative;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
    }

    .truck-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .truck-plate {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .truck-status {
      font-size: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: 500;

      &.active { background: #E1F5EE; color: #0F6E56; }
      &.inactive { background: #f0f0ee; color: #888; }
    }

    .truck-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: 11px;
      color: #999;
    }

    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .nearby-trucks {
      padding: 16px;
      background: white;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 12px;
    }

    .truck-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .truck-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9f9f7;
      border-radius: 10px;
    }

    .truck-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.active { background: #E1F5EE; color: #0F6E56; }
      &.inactive { background: #f0f0ee; color: #888; }

      svg { width: 18px; height: 18px; }
    }

    .truck-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .truck-plates {
      font-size: 14px;
      font-weight: 600;
    }

    .truck-driver {
      font-size: 12px;
      color: #888;
    }

    .truck-distance {
      font-size: 13px;
      font-weight: 500;
      color: #1D9E75;
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

  private getCurrentLocation() {
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
