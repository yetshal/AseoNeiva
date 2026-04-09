import { Component, OnInit, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, IonicModule],
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

      <div class="truck-info-card">
        <div class="truck-header">
          <span class="truck-plate">HUQ-432</span>
          <span class="truck-status in-route">En camino</span>
        </div>
        <div class="truck-details">
          <div class="detail-item">
            <span class="detail-label">Llegada estimada</span>
            <span class="detail-value">12 min</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Conductor</span>
            <span class="detail-value">Carlos Medina</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Distancia</span>
            <span class="detail-value">800 m</span>
          </div>
        </div>
      </div>

      <div class="nearby-trucks">
        <h3 class="section-title">Camiones cercanos</h3>
        <div class="truck-list">
          @for (truck of nearbyTrucks; track truck.plate) {
            <div class="truck-item" (click)="selectTruck(truck.plate)">
              <div class="truck-icon" [class]="truck.status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
                </svg>
              </div>
              <div class="truck-info">
                <span class="truck-plates">{{ truck.plate }}</span>
                <span class="truck-driver">{{ truck.driver }}</span>
              </div>
              <span class="truck-distance">{{ truck.distance }}m</span>
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
      }
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
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

    .map-container {
      height: 45vh;
      width: 100%;
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

      &.in-route { background: #E1F5EE; color: #0F6E56; }
      &.collected { background: #E6F1FB; color: #185FA5; }
      &.out { background: #f0f0ee; color: #888; }
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

      &.in-route { background: #E1F5EE; color: #0F6E56; }
      &.collected { background: #E6F1FB; color: #185FA5; }
      &.out { background: #f0f0ee; color: #888; }

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
export class MapPage implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private map: L.Map | null = null;
  private userMarker: L.CircleMarker | null = null;
  private truckMarker: L.CircleMarker | null = null;

  nearbyTrucks = [
    { plate: 'HUQ-432', driver: 'Carlos Medina', status: 'in-route', distance: 800 },
    { plate: 'HUQ-561', driver: 'Pedro Ospina', status: 'in-route', distance: 1200 },
    { plate: 'HUQ-290', driver: 'Jhon Vargas', status: 'collected', distance: 2500 }
  ];

  private readonly CENTER = L.latLng(2.9273, -75.2819);

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.CENTER,
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.userMarker = L.circleMarker(this.CENTER, {
      radius: 12,
      fillColor: '#185FA5',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 1
    }).addTo(this.map);

    const truckPos = L.latLng(2.9341, -75.2765);
    this.truckMarker = L.circleMarker(truckPos, {
      radius: 14,
      fillColor: '#1D9E75',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 1
    }).addTo(this.map);

    this.userMarker.bindPopup('Tu ubicación');
    this.truckMarker.bindPopup('Camión HUQ-432');
  }

  selectTruck(plate: string) {
    console.log('Selected truck:', plate);
  }
}
