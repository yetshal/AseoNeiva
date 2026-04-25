import { Component, OnInit, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { GamificationService } from '../services/gamification.service';
import { FleetService, Vehicle } from '../services/fleet.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ScheduleModalComponent } from './schedule-modal.component';
import { Geolocation } from '@capacitor/geolocation';

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

  user: User | null = null;
  
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
    // Única fuente de verdad: suscripción al usuario centralizado
    this.auth.currentUser$.subscribe(u => {
      this.user = u;
      if (u) {
        this.collectionSchedule = u.collection_schedule || [];
        this.currentPoints = u.points || 0;
        this.currentStreak = u.streak || 0;
        this.validReports = u.valid_reports || 0;
      }
      this.updateStatus();
    });

    this.loadActiveFleet();
    this.startStatusTimer();
    this.getCurrentLocation();
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

  ionViewWillEnter() {
    this.loadGamificationData();
    this.loadActiveFleet();
  }

  async getCurrentLocation() {
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      this.userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      this.updateStatus();
    } catch (e) {
      // Default a Neiva centro si falla
      this.userCoords = { lat: 2.9273, lng: -75.2819 };
    }
  }

  loadGamificationData() {
    this.gamification.getGamificationProfile().subscribe({
      next: (data) => {
        this.levelProgress = data.progressToNextLevel;
        this.recordStreak = data.user.streak; 
        
        if (data.user) {
          // Fusionar datos del servidor con los locales para no perder campos como el token
          const fullUser = { ...this.user, ...data.user } as User;
          this.auth.updateUser(fullUser);
        }
      },
      error: () => {}
    });
  }

  startStatusTimer() {
    setInterval(() => {
      this.updateStatus();
      this.loadActiveFleet();
    }, 15000);
  }

  updateStatus() {
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
    this.http.patch(`${this.apiUrl}/citizen/profile`, { collection_schedule: newSchedule }).subscribe({
      next: (res: any) => {
        if (res.user) {
          this.auth.updateUser(res.user as User);
          this.showToast('Horario actualizado', 'success');
        }
      },
      error: () => this.showToast('Error al guardar horario', 'danger')
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
  goToMap(): void { this.router.navigate(['/tabs/map']); }
  goToReport(): void { this.router.navigate(['/tabs/report']); }
  goToNotifications(): void {}
}
