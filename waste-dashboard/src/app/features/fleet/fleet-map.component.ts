import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FleetService, NearbyReport } from '../../core/services/fleet.service';
import { SocketService } from '../../core/services/socket.service';
import { Vehicle, VehicleDetail } from '../../shared/models/fleet.model';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

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
  private socket = inject(SocketService);

  vehicles:        Vehicle[]       = [];
  selectedVehicle: VehicleDetail | null = null;
  nearbyReports:   NearbyReport[] = [];
  selectedReport:  NearbyReport | null = null;
  reportsLoading   = false;
  validating       = false;
  successMessage   = '';
  errorMessage     = '';
  searchTerm    = '';
  statusFilter  = '';
  loading       = true;
  mapLoading    = true;
  error         = '';

  private map:     L.Map | null = null;
  private markers: Map<string, L.CircleMarker> = new Map();
  private reportMarkers: Map<string, L.Marker> = new Map();
  private socketSub: Subscription | null = null;

  private readonly CENTER: L.LatLngExpression = [2.9273, -75.2819];

  ngOnInit(): void {
    this.loadVehicles();
    
    // Suscribirse a actualizaciones en tiempo real via Socket.io
    this.socketSub = this.socket.getVehicleUpdates().subscribe(data => {
      this.handleVehicleMovement(data);
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.socketSub) this.socketSub.unsubscribe();
  }

  /**
   * Maneja el movimiento de un vehículo recibido por WebSockets
   */
  private handleVehicleMovement(data: any): void {
    const { vehicleId, latitude, longitude } = data;
    
    // 1. Actualizar datos en el array local de vehículos
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      vehicle.latitude = latitude;
      vehicle.longitude = longitude;
    }

    // 2. Mover marcador en el mapa
    if (this.map && this.markers.has(vehicleId)) {
      const pos = L.latLng(Number(latitude), Number(longitude));
      this.markers.get(vehicleId)?.setLatLng(pos);
      
      // Si el vehículo está seleccionado, centrar el mapa si es necesario
      if (this.selectedVehicle && this.selectedVehicle.vehicle.id === vehicleId) {
        // Podríamos centrar automáticamente o solo actualizar el detalle
        this.selectedVehicle.vehicle.latitude = latitude;
        this.selectedVehicle.vehicle.longitude = longitude;
      }
    }
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
      this.loadNearbyReports(id);
      if (this.map && detail.vehicle.latitude && detail.vehicle.longitude) {
        this.map.panTo([Number(detail.vehicle.latitude), Number(detail.vehicle.longitude)]);
        this.map.setZoom(15);
      }
    });
  }

  loadNearbyReports(vehicleId: string): void {
    this.reportsLoading = true;
    this.svc.getNearbyReports(vehicleId).subscribe({
      next: res => {
        this.nearbyReports = res.data;
        this.reportsLoading = false;
        this.updateReportMarkers();
      },
      error: () => {
        this.nearbyReports = [];
        this.reportsLoading = false;
      }
    });
  }

  private updateReportMarkers(): void {
    if (!this.map) return;

    this.reportMarkers.forEach(m => this.map!.removeLayer(m));
    this.reportMarkers.clear();

    this.nearbyReports.forEach(r => {
      if (!r.latitude || !r.longitude) return;

      const icon = L.divIcon({
        className: 'report-marker',
        html: '<div style="background:#EF4444;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([r.latitude, r.longitude], { icon });
      marker.bindPopup(`
        <strong>${r.type}</strong><br>
        ${r.description || 'Sin descripción'}<br>
        <small>${new Date(r.createdAt).toLocaleDateString()}</small>
      `);
      marker.on('click', () => this.openReport(r));
      marker.addTo(this.map!);
      this.reportMarkers.set(r.id, marker);
    });
  }

  openReport(report: NearbyReport): void {
    this.selectedReport = report;
  }

  closeReport(): void {
    this.selectedReport = null;
  }

  validateReport(isValid: boolean): void {
    if (!this.selectedVehicle || !this.selectedReport) return;
    
    this.validating = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.svc.validateReport(
      this.selectedVehicle.vehicle.id,
      this.selectedReport.id,
      isValid
    ).subscribe({
      next: res => {
        this.validating = false;
        this.successMessage = res.message;
        setTimeout(() => this.successMessage = '', 3000);
        
        this.nearbyReports = this.nearbyReports.filter(r => r.id !== this.selectedReport!.id);
        const marker = this.reportMarkers.get(this.selectedReport!.id);
        if (marker && this.map) {
          this.map.removeLayer(marker);
          this.reportMarkers.delete(this.selectedReport!.id);
        }
        
        this.selectedReport = null;
        
        if (this.selectedVehicle) {
          this.loadNearbyReports(this.selectedVehicle.vehicle.id);
        }
      },
      error: () => {
        this.validating = false;
        this.errorMessage = 'Error al validar el reporte.';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  closeDetail(): void {
    this.selectedVehicle = null;
    this.nearbyReports = [];
    this.selectedReport = null;
    this.reportMarkers.forEach(m => this.map?.removeLayer(m));
    this.reportMarkers.clear();
  }

  onSearch(): void {
    this.loadVehicles();
  }

  onStatusFilter(): void {
    this.loadVehicles();
  }

  getReportStatusLabel(status: string): string {
    return { pending: 'Pendiente', reviewing: 'En revisión', resolved: 'Resuelto' }[status] ?? status;
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
