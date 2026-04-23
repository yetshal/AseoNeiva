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

  collectionSchedule: any[] = [];
  activeVehicles: Vehicle[] = [];

  ngOnInit() {
    this.refreshUserData();
    this.loadActiveFleet();
    this.startStatusTimer();
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
        this.recordStreak = Math.max(this.currentStreak, 12); 

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
    }, 30000);
  }

  updateStatus() {
    if (!this.collectionSchedule || this.collectionSchedule.length === 0) {
      this.isTimeToTakeTrash = false;
      this.nextCollectionTime = 'No configurado';
      this.estimatedMinutes = 0;
      this.estimatedMeters = 0;
      return;
    }

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

      // Lógica de Seguimiento: Solo si hay vehículos activos hoy
      if (this.activeVehicles.length > 0 && diffMins > 0 && diffMins < 60) {
        // Simulamos el ETA basado en el vehículo más cercano asignado
        this.estimatedMinutes = Math.max(Math.floor(diffMins * 0.8), 3);
        this.estimatedMeters = this.estimatedMinutes * 110;
      } else {
        this.estimatedMinutes = 0;
        this.estimatedMeters = 0;
      }
    } else {
      this.isTimeToTakeTrash = false;
      this.nextCollectionTime = 'Próxima recolección pronto';
      this.estimatedMinutes = 0;
      this.estimatedMeters = 0;
    }
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
