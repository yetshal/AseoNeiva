import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { GamificationService } from '../services/gamification.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  user = this.auth.getCurrentUser();
  
  estimatedMinutes = 12;
  estimatedMeters = 800;
  isTimeToTakeTrash = true;
  nextCollectionTime = '6:00 AM';
  currentPoints = 0;
  currentStreak = 0;
  recordStreak = 21;

  collectionSchedule = [
    { day: 'Lunes', time: '6:00 AM', zone: 'Norte' },
    { day: 'Miércoles', time: '6:00 AM', zone: 'Sur' },
    { day: 'Viernes', time: '6:00 AM', zone: 'Centro' }
  ];

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    this.loadGamificationData();
  }

  loadGamificationData() {
    this.gamification.getGamificationProfile().subscribe({
      next: (data) => {
        this.currentPoints = data.user.points;
        this.currentStreak = data.user.streak;
      },
      error: () => {}
    });
  }

  async registerTrashCollection() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.gamification.registerCollection({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }).subscribe({
            next: (response) => {
              this.showToast(`+${response.pointsEarned} puntos por sacar la basura!`, 'success');
              this.currentPoints = response.newTotalPoints;
              this.currentStreak = response.newStreak;
              this.user = this.auth.getCurrentUser();
              if (this.user) {
                this.user.points = response.newTotalPoints;
                this.user.streak = response.newStreak;
                this.user.level = response.newLevel;
                this.auth.updateUser(this.user);
              }
            },
            error: (err) => {
              this.showToast('Error al registrar', 'danger');
            }
          });
        },
        (error) => {
          this.gamification.registerCollection().subscribe({
            next: (response) => {
              this.showToast(`+${response.pointsEarned} puntos por sacar la basura!`, 'success');
              this.currentPoints = response.newTotalPoints;
              this.currentStreak = response.newStreak;
            },
            error: () => {
              this.showToast('Error al registrar', 'danger');
            }
          });
        }
      );
    } else {
      this.gamification.registerCollection().subscribe({
        next: (response) => {
          this.showToast(`+${response.pointsEarned} puntos por sacar la basura!`, 'success');
          this.currentPoints = response.newTotalPoints;
          this.currentStreak = response.newStreak;
        },
        error: () => {
          this.showToast('Error al registrar', 'danger');
        }
      });
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: color === 'success' ? 'success' : 'danger',
      position: 'top'
    });
    await toast.present();
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  getLevelTitle(): string {
    if (!this.user) return 'Novato';
    const level = this.user.level || 1;
    if (level >= 5) return 'Master';
    if (level >= 4) return 'Experto';
    if (level >= 3) return 'Avanzado';
    if (level >= 2) return 'Intermedio';
    return 'Novato';
  }

  getProgressToNextLevel(): number {
    if (!this.user) return 0;
    const points = this.user.points || 0;
    const currentLevel = this.user.level || 1;
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * 100;
    const progress = ((points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  goToProfile(): void {
    this.router.navigate(['/tabs/profile']);
  }

  goToNotifications(): void {
    // Would navigate to notifications
  }
}
