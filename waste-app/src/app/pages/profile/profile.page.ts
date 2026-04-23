import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { GamificationService, Achievement, WeeklyStreak } from '../../services/gamification.service';
import { User } from '../../models/user.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Editar Perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="form-container">
        <ion-item fill="outline" class="ion-margin-bottom">
          <ion-label position="floating">Nombre Completo</ion-label>
          <ion-input [(ngModel)]="editData.name" type="text"></ion-input>
        </ion-item>
        
        <ion-item fill="outline" class="ion-margin-bottom">
          <ion-label position="floating">Teléfono</ion-label>
          <ion-input [(ngModel)]="editData.phone" type="tel"></ion-input>
        </ion-item>

        <ion-item fill="outline" class="ion-margin-bottom">
          <ion-label position="floating">Dirección</ion-label>
          <ion-input [(ngModel)]="editData.address" type="text"></ion-input>
        </ion-item>

        <ion-button expand="block" (click)="save()" [disabled]="loading" class="ion-margin-top" color="primary">
          {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
        </ion-button>
      </div>
    </ion-content>
  `
})
export class EditProfileModal {
  @Input() user!: User;
  editData: any = {};
  loading = false;

  private modalCtrl = inject(ModalController);
  private auth = inject(AuthService);
  private toastCtrl = inject(ToastController);

  ngOnInit() {
    this.editData = {
      name: this.user.name,
      phone: this.user.phone || '',
      address: this.user.address || ''
    };
  }

  dismiss() { this.modalCtrl.dismiss(); }

  save() {
    this.loading = true;
    this.auth.updateProfile(this.editData).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Perfil actualizado con éxito', 'success');
        this.modalCtrl.dismiss(true);
      },
      error: () => {
        this.loading = false;
        this.showToast('Error al actualizar perfil', 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 2000, position: 'top' });
    t.present();
  }
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="white">
        <ion-title mode="ios">Mi Perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="goToSettings()">
            <ion-icon slot="icon-only" name="settings-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="profile-content">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar" *ngIf="!user?.avatar_url">{{ getUserInitials() }}</div>
          <img [src]="user?.avatar_url" class="avatar-img" *ngIf="user?.avatar_url">
          <button class="edit-avatar" (click)="editAvatar()">
            <ion-icon name="camera-outline"></ion-icon>
          </button>
        </div>
        <h1 class="user-name">{{ user?.name || 'Cargando...' }}</h1>
        <span class="user-email">{{ user?.email }}</span>
      </div>

      <!-- Stats Grid -->
      <div class="gamification-section">
        <div class="stat-card">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{{ user?.points || 0 }}</span>
          <span class="stat-label">Puntos</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🔥</span>
          <span class="stat-value">{{ user?.streak || 0 }}</span>
          <span class="stat-label">Racha</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏆</span>
          <span class="stat-value">{{ achievementsCount }}</span>
          <span class="stat-label">Logros</span>
        </div>
      </div>

      <!-- Level Section -->
      <div class="level-section shadow-sm">
        <div class="level-header">
          <div class="level-info">
            <span class="level-badge">Nivel {{ user?.level || 1 }}</span>
            <span class="level-title">{{ getLevelTitle() }}</span>
          </div>
          <span class="level-next">{{ pointsToNextLevel }} pts para subir</span>
        </div>
        <div class="level-progress">
          <div class="progress-fill" [style.width.%]="progressToNextLevel"></div>
        </div>
      </div>

      <!-- Weekly Streak -->
      <div class="streak-section shadow-sm">
        <h2 class="section-title">Actividad Semanal</h2>
        <div class="streak-days">
          @for (day of weeklyStreak; track day.day) {
            <div class="day-item" [class.active]="day.completed">
              <span class="day-name">{{ day.day }}</span>
              <div class="day-indicator">
                <ion-icon name="checkmark-outline" *ngIf="day.completed"></ion-icon>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Achievements -->
      <div class="achievements-section shadow-sm">
        <div class="section-header">
          <h2 class="section-title">Logros Desbloqueados</h2>
          <button class="see-more" (click)="showAllAchievements()">Ver todos</button>
        </div>
        <div class="achievements-list">
          @for (achievement of unlockedAchievements; track achievement.id) {
            <div class="achievement-item">
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <span class="achievement-name">{{ achievement.name }}</span>
                <span class="achievement-desc">{{ achievement.description }}</span>
              </div>
              <ion-icon name="ribbon" color="primary"></ion-icon>
            </div>
          } @empty {
            <div class="empty-achievements">Participa activamente para ganar logros</div>
          }
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions-section">
        <button class="action-btn" (click)="goToSettings()">
          <ion-icon name="person-outline"></ion-icon>
          <span>Editar información</span>
        </button>
        <button class="action-btn" (click)="goToHistory()">
          <ion-icon name="document-text-outline"></ion-icon>
          <span>Historial de reportes</span>
        </button>
        <button class="action-btn logout" (click)="logout()">
          <ion-icon name="log-out-outline"></ion-icon>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-content { --background: #f8f9fa; }
    .profile-header { text-align: center; padding: 40px 16px; background: linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%); color: white; border-bottom-left-radius: 30px; border-bottom-right-radius: 30px; }
    .avatar-section { position: relative; display: inline-block; margin-bottom: 16px; }
    .avatar, .avatar-img { width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 800; border: 4px solid rgba(255,255,255,0.4); object-fit: cover; }
    .edit-avatar { position: absolute; bottom: 0; right: 0; width: 34px; height: 32px; border-radius: 50%; border: none; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2); ion-icon { font-size: 18px; color: #1D9E75; } }
    .user-name { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
    .user-email { font-size: 14px; opacity: 0.85; letter-spacing: 0.3px; }

    .gamification-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 20px; margin: -30px 16px 16px; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    .stat-card { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .stat-icon { font-size: 24px; }
    .stat-value { font-size: 22px; font-weight: 800; color: #1a1a1a; }
    .stat-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; }

    .shadow-sm { box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
    .level-section { margin: 0 16px 16px; padding: 20px; background: white; border-radius: 18px; }
    .level-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .level-info { display: flex; align-items: center; gap: 10px; }
    .level-badge { font-size: 11px; padding: 4px 14px; background: #1D9E75; color: white; border-radius: 20px; font-weight: 800; }
    .level-title { font-size: 15px; font-weight: 700; color: #374151; }
    .level-next { font-size: 11px; color: #9ca3af; font-weight: 500; }
    .level-progress { height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #1D9E75, #34d399); border-radius: 10px; transition: width 1s ease-out; }

    .streak-section { margin: 0 16px 16px; padding: 20px; background: white; border-radius: 18px; }
    .section-title { font-size: 17px; font-weight: 700; margin: 0 0 16px; color: #1a1a1a; }
    .streak-days { display: flex; justify-content: space-between; }
    .day-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .day-name { font-size: 11px; color: #9ca3af; font-weight: 700; }
    .day-indicator { width: 40px; height: 40px; border-radius: 14px; background: #f8fafc; border: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
    .active .day-indicator { background: #E1F5EE; color: #0F6E56; font-size: 22px; border: none; }

    .achievements-section { margin: 0 16px 16px; padding: 20px; background: white; border-radius: 18px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; .section-title { margin: 0; } }
    .see-more { background: none; border: none; color: #1D9E75; font-size: 13px; font-weight: 700; cursor: pointer; }
    .achievements-list { display: flex; flex-direction: column; gap: 12px; }
    .achievement-item { display: flex; align-items: center; gap: 14px; padding: 12px; background: #f8fafc; border-radius: 14px; border: 1px solid #f1f5f9; }
    .achievement-icon { font-size: 28px; }
    .achievement-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .achievement-name { font-size: 14px; font-weight: 700; color: #334155; }
    .achievement-desc { font-size: 12px; color: #64748b; }
    .empty-achievements { text-align: center; padding: 10px; font-size: 14px; color: #94a3b8; font-style: italic; }

    .actions-section { padding: 16px 16px 48px; }
    .action-btn { width: 100%; display: flex; align-items: center; gap: 14px; padding: 16px; background: white; border: 1px solid #f1f5f9; border-radius: 16px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; &:active { background: #f8fafc; transform: scale(0.98); } ion-icon { font-size: 22px; color: #64748b; } span { font-size: 15px; color: #334155; font-weight: 700; } &.logout { border-color: #fee2e2; background: #fffafb; margin-top: 15px; ion-icon { color: #ef4444; } span { color: #ef4444; } } }
  `]
})
export class ProfilePage implements OnInit {
  private auth = inject(AuthService);
  private gamification = inject(GamificationService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  user: User | null = null;
  achievementsCount = 0;
  pointsToNextLevel = 0;
  progressToNextLevel = 0;
  weeklyStreak: WeeklyStreak[] = [];
  unlockedAchievements: Achievement[] = [];

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.user = u;
      if (u) this.loadGamificationData();
    });
  }

  loadGamificationData() {
    this.gamification.getGamificationProfile().subscribe({
      next: (data) => {
        this.achievementsCount = data.achievements.filter(a => a.unlocked).length;
        this.unlockedAchievements = data.achievements.filter(a => a.unlocked).slice(0, 3);
        this.pointsToNextLevel = data.pointsToNextLevel;
        this.progressToNextLevel = data.progressToNextLevel;
        this.weeklyStreak = data.weeklyStreak;
      },
      error: (err) => {
        console.error('Error loading gamification:', err);
      }
    });
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  getLevelTitle(): string {
    const level = this.user?.level || 1;
    if (level >= 5) return 'Maestro del Aseo';
    if (level >= 4) return 'Experto';
    if (level >= 3) return 'Avanzado';
    if (level >= 2) return 'Intermedio';
    return 'Novato';
  }

  async editAvatar() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        allowEditing: true
      });

      if (image.dataUrl) {
        this.auth.updateProfile({ avatar_url: image.dataUrl }).subscribe({
          next: () => this.showToast('Foto de perfil actualizada', 'success'),
          error: () => this.showToast('Error al subir imagen', 'danger')
        });
      }
    } catch (e) {}
  }

  async goToSettings() {
    const modal = await this.modalCtrl.create({
      component: EditProfileModal,
      componentProps: { user: this.user }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.loadGamificationData();
    }
  }

  goToHistory() {
    this.router.navigate(['/tabs/report']);
  }

  async showAllAchievements() {
    const alert = await this.alertCtrl.create({
      header: 'Tus Logros',
      message: 'Próximamente: Lista detallada de todos los logros desbloqueables.',
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, color, duration: 2000, position: 'top' });
    t.present();
  }
}
