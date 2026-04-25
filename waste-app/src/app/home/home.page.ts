import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { GamificationService } from '../services/gamification.service';
import { FleetService, Vehicle } from '../services/fleet.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ScheduleModalComponent } from './schedule-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage implements OnInit {
  private auth = inject(AuthService);
  private gamification = inject(GamificationService);
  private fleet = inject(FleetService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private modalCtrl = inject(ModalController);
  private http = inject(HttpClient);
  private apiUrl = (environment as any).apiUrl;

  user = this.auth.getCurrentUser();
  
  estimatedMinutes = 0;
  estimatedMeters = 0;
  isTimeToTakeTrash = false;
  nextCollectionTime = '--:--';
  
  currentPoints = 0;
  currentStreak = 0;
  recordStreak = 0;
  levelProgress = 0;
  validReports = 0;

  userCoords: { lat: number, lng: number } | null = null;
  collectionSchedule: any[] = [];
  activeVehicles: Vehicle[] = [];

  ngOnInit() {
    this.refreshUserData();
    this.loadActiveFleet();
    this.startStatusTimer();
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        this.userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.updateStatus();
      }, () => {
        // Default a Neiva centro si falla
        this.userCoords = { lat: 2.9273, lng: -75.2819 };
      });
    }
  }

  refreshUserData() {
    this.user = this.auth.getCurrentUser();
    if (this.user?.collection_schedule) {
      this.collectionSchedule = this.user.collection_schedule;
    }
    this.loadGamificationData();
  }

  loadActiveFleet() {
    this.fleet.getActiveVehicles().subscribe({
      next: (v) => {
        this.activeVehicles = v;
        this.updateStatus();
      },
      error: () => { this.activeVehicles = []; }
    });
  }

  loadGamificationData() {
    this.gamification.getGamificationProfile().subscribe({
      next: (data) => {
        this.currentPoints = data.user.points;
        this.currentStreak = data.user.streak;
        this.levelProgress = data.progressToNextLevel;
        this.validReports = data.user.valid_reports;
        this.recordStreak = this.currentStreak; 

        if (this.user) {
          const updatedUser = { ...this.user, points: data.user.points, streak: data.user.streak, level: data.user.level, collection_schedule: data.user.collection_schedule };
          this.auth.updateUser(updatedUser);
          this.user = updatedUser;
        }
        
        if (data.user.collection_schedule) {
          this.collectionSchedule = data.user.collection_schedule;
          this.updateStatus();
        }
      },
      error: () => {}
    });
  }

  startStatusTimer() {
    setInterval(() => {
      this.updateStatus();
      this.loadActiveFleet();
    }, 15000); // Reducido a 15s para más fluidez
  }

  updateStatus() {
    // 1. Determinar próxima recolección según horario
    if (this.collectionSchedule && this.collectionSchedule.length > 0) {
      const now = new Date();
      const daysWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const todayName = daysWeek[now.getDay()];
      const todaySchedule = this.collectionSchedule.find((s: any) => s.day === todayName);

      if (todaySchedule) {
        this.nextCollectionTime = todaySchedule.time;
        const [hours, minutes] = todaySchedule.time.split(':').map(Number);
        const scheduleDate = new Date();
        scheduleDate.setHours(hours, minutes, 0);

        const diffMs = scheduleDate.getTime() - now.getTime();
        const diffMins = diffMs / 60000;
        this.isTimeToTakeTrash = diffMins > 0 && diffMins <= 60;
      } else {
        this.isTimeToTakeTrash = false;
        this.nextCollectionTime = 'Próxima pronto';
      }
    } else {
      this.isTimeToTakeTrash = false;
      this.nextCollectionTime = 'No configurado';
    }

    // 2. Calcular Seguimiento Real si hay camiones activos
    if (this.activeVehicles.length > 0 && this.userCoords) {
      let minDistance = Infinity;
      
      this.activeVehicles.forEach(v => {
        const d = this.calculateDistance(
          this.userCoords!.lat, this.userCoords!.lng, 
          Number(v.latitude), Number(v.longitude)
        );
        if (d < minDistance) minDistance = d;
      });

      this.estimatedMeters = Math.round(minDistance);
      // Asumiendo velocidad promedio de 20km/h (333 metros/minuto)
      this.estimatedMinutes = Math.max(Math.ceil(minDistance / 333), 1);
    } else {
      this.estimatedMinutes = 0;
      this.estimatedMeters = 0;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async openScheduleConfig() {
    const modal = await this.modalCtrl.create({ component: ScheduleModalComponent, componentProps: { currentSchedule: this.collectionSchedule } });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) this.saveSchedule(data);
  }

  saveSchedule(newSchedule: any[]) {
    if (!this.user) return;
    this.http.patch(`${this.apiUrl}/users/${this.user.id}`, { collection_schedule: newSchedule }).subscribe({
      next: () => { this.showToast('Horario actualizado', 'success'); this.refreshUserData(); },
      error: () => this.showToast('Error al guardar', 'danger')
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color: color === 'success' ? 'success' : 'danger', position: 'top' });
    await toast.present();
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  getDisplayName(): string {
    if (!this.user?.name) return 'Usuario';
    return this.user.name.trim().split(/\s+/)[0];
  }

  getLevelTitle(): string {
    const level = this.user?.level || 1;
    if (level >= 5) return 'Master del Aseo';
    if (level >= 4) return 'Experto';
    if (level >= 3) return 'Avanzado';
    if (level >= 2) return 'Intermedio';
    return 'Novato';
  }

  goToProfile(): void { this.router.navigate(['/tabs/profile']); }
  goToNotifications(): void {}
}
