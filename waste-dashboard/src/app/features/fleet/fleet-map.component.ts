import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FleetService } from '../../core/services/fleet.service';
import { Vehicle, VehicleDetail } from '../../shared/models/fleet.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-fleet-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fleet-map.component.html',
  styleUrl: './fleet-map.component.scss'
})
export class FleetMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private svc = inject(FleetService);

  vehicles:        Vehicle[]       = [];
  selectedVehicle: VehicleDetail | null = null;
  searchTerm    = '';
  statusFilter  = '';
  loading       = true;
  mapLoading    = true;
  error         = '';

  private map:     L.Map | null = null;
  private markers: Map<string, L.CircleMarker> = new Map();
  private refreshInterval: any;

  private readonly CENTER: L.LatLngExpression = [2.9273, -75.2819];

  ngOnInit(): void {
    this.loadVehicles();
    this.refreshInterval = setInterval(() => this.loadVehicles(true), 30000);
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.CENTER,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.mapLoading = false;
    this.updateMarkers();
  }

  loadVehicles(silent = false): void {
    if (!silent) this.loading = true;

    this.svc.getVehicles({
      status: this.statusFilter || undefined,
      search: this.searchTerm   || undefined,
    }).subscribe({
      next: res => {
        this.vehicles = res.data;
        this.loading  = false;
        this.updateMarkers();
      },
      error: () => {
        this.error   = 'No se pudo cargar la flota.';
        this.loading = false;
      }
    });
  }

  private updateMarkers(): void {
    if (!this.map) return;

    const seen = new Set<string>();

    this.vehicles.forEach(v => {
      if (v.latitude == null || v.longitude == null) return;
      seen.add(v.id);

      const pos = L.latLng(Number(v.latitude), Number(v.longitude));

      if (this.markers.has(v.id)) {
        this.markers.get(v.id)?.setLatLng(pos);
      } else {
        const marker = L.circleMarker(pos, {
          radius: 10,
          fillColor: this.statusColor(v.status),
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 1
        });
        
        marker.bindPopup(`
          <strong>${v.plate}</strong><br>
          Conductor: ${v.driver_name || 'Sin conductor'}<br>
          Estado: ${this.statusLabel(v.status)}
        `);
        
        marker.on('click', () => this.selectVehicle(v.id));
        marker.addTo(this.map!);
        this.markers.set(v.id, marker);
      }
    });

    this.markers.forEach((marker, id) => {
      if (!seen.has(id)) {
        if (this.map && marker) {
          this.map.removeLayer(marker as any);
        }
        this.markers.delete(id);
      }
    });
  }

  selectVehicle(id: string): void {
    this.svc.getVehicleById(id).subscribe(detail => {
      this.selectedVehicle = detail;
      if (this.map && detail.vehicle.latitude && detail.vehicle.longitude) {
        this.map.panTo([Number(detail.vehicle.latitude), Number(detail.vehicle.longitude)]);
        this.map.setZoom(15);
      }
    });
  }

  closeDetail(): void {
    this.selectedVehicle = null;
  }

  onSearch(): void {
    this.loadVehicles();
  }

  onStatusFilter(): void {
    this.loadVehicles();
  }

  statusColor(status: string): string {
    switch (status) {
      case 'active':          return '#1D9E75';
      case 'maintenance':     return '#EAB308';
      case 'out_of_service':  return '#EF4444';
      default:                return '#9CA3AF';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'active':          return 'Activo';
      case 'maintenance':     return 'Mantenimiento';
      case 'out_of_service':  return 'Fuera de servicio';
      default:                return status;
    }
  }

  typeLabel(type: string): string {
    switch (type) {
      case 'truck':     return 'Camión recolector';
      case 'sweeper':   return 'Barredora';
      case 'compactor': return 'Compactador';
      default:          return type;
    }
  }

  get activeCount():      number { return this.vehicles.filter(v => v.status === 'active').length; }
  get maintenanceCount(): number { return this.vehicles.filter(v => v.status === 'maintenance').length; }
  get offCount():         number { return this.vehicles.filter(v => v.status === 'out_of_service').length; }
}
