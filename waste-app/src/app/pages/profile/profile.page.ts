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
    <ion-header class="ion-no-border app-page-header profile-top-header">
      <ion-toolbar>
        <div class="app-toolbar-shell">
          <div class="app-toolbar-card">
            <div class="app-toolbar-copy">
              <span class="app-toolbar-eyebrow">Cuenta</span>
              <div class="app-toolbar-title-row">
                <h1 class="app-toolbar-title">Mi perfil</h1>
                <span class="app-toolbar-chip">{{ achievementsCount }} logros</span>
              </div>
            </div>

            <div class="app-toolbar-actions">
              <button class="app-toolbar-icon-button emphasis" (click)="goToSettings()">
                <ion-icon name="settings-outline"></ion-icon>
              </button>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="profile-content">
      <div class="profile-header-container">
        <div class="header-overlay"></div>
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar-glow"></div>
            <div class="avatar shadow-premium" *ngIf="!user?.avatar_url">{{ getUserInitials() }}</div>
            <img [src]="user?.avatar_url" class="avatar-img shadow-premium" *ngIf="user?.avatar_url">
            <button class="edit-avatar" (click)="editAvatar()">
              <ion-icon name="camera"></ion-icon>
            </button>
          </div>
          <h1 class="user-name">{{ user?.name || 'Usuario' }}</h1>
          <p class="user-email">{{ user?.email }}</p>
          
          <div class="level-badge-premium gradient-primary shadow-premium">
            <span class="l-lvl">NIVEL {{ user?.level || 1 }}</span>
            <span class="l-name">{{ getLevelTitle() }}</span>
          </div>
        </div>
      </div>

      <div class="profile-body ion-padding">
        <!-- Main Stats -->
        <div class="gamification-grid">
          <div class="premium-stat-card app-panel">
            <span class="p-icon">
              <ion-icon name="sparkles-outline"></ion-icon>
            </span>
            <div class="p-info">
              <span class="p-val">{{ user?.points || 0 }}</span>
              <span class="p-lab">Puntos</span>
            </div>
          </div>
          <div class="premium-stat-card app-panel">
            <span class="p-icon">
              <ion-icon name="flame-outline"></ion-icon>
            </span>
            <div class="p-info">
              <span class="p-val">{{ user?.streak || 0 }}</span>
              <span class="p-lab">Racha</span>
            </div>
          </div>
          <div class="premium-stat-card app-panel">
            <span class="p-icon">
              <ion-icon name="ribbon-outline"></ion-icon>
            </span>
            <div class="p-info">
              <span class="p-val">{{ achievementsCount }}</span>
              <span class="p-lab">Logros</span>
            </div>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="section-card app-panel animate-up">
          <div class="section-header">
            <h2 class="section-title">Próximo Nivel</h2>
            <span class="progress-val">{{ progressToNextLevel }}%</span>
          </div>
          <div class="modern-progress-container">
            <div class="progress-bar-fill" [style.width.%]="progressToNextLevel"></div>
          </div>
          <p class="progress-hint">Te faltan <strong>{{ pointsToNextLevel }} puntos</strong> para el siguiente rango</p>
        </div>

        <!-- Weekly Activity -->
        <div class="section-card app-panel animate-up" style="animation-delay: 0.1s">
          <h2 class="section-title">Actividad Semanal</h2>
          <div class="streak-grid">
            @for (day of weeklyStreak; track day.day) {
              <div class="day-item" [class.active]="day.completed">
                <div class="day-dot-container">
                  <div class="day-dot"></div>
                </div>
                <span class="day-name">{{ day.day.substring(0, 1) }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Achievements -->
        <div class="section-card app-panel animate-up" style="animation-delay: 0.2s">
          <div class="section-header">
            <h2 class="section-title">Logros Destacados</h2>
            <button class="action-link" (click)="showAllAchievements()">Ver todos</button>
          </div>
          <div class="achievements-modern-list">
            @for (achievement of unlockedAchievements; track achievement.id) {
              <div class="achievement-row">
                <div class="a-icon-box shadow-premium">{{ achievement.icon }}</div>
                <div class="a-info">
                  <span class="a-name">{{ achievement.name }}</span>
                  <span class="a-desc">{{ achievement.description }}</span>
                </div>
                <div class="a-medal gradient-primary">
                  <ion-icon name="ribbon"></ion-icon>
                </div>
              </div>
            } @empty {
              <div class="empty-ach-state">
                <div class="empty-icon">
                  <ion-icon name="medal-outline"></ion-icon>
                </div>
                <p>¡Realiza reportes para ganar tu primer logro!</p>
              </div>
            }
          </div>
        </div>

        <!-- Settings Actions -->
        <div class="actions-group animate-up" style="animation-delay: 0.3s">
          <button class="premium-action-btn app-panel" (click)="goToSettings()">
            <div class="btn-icon-bg"><ion-icon name="person-outline"></ion-icon></div>
            <span>Editar Perfil</span>
            <ion-icon name="chevron-forward-outline" class="btn-arrow"></ion-icon>
          </button>
          <button class="premium-action-btn app-panel" (click)="goToHistory()">
            <div class="btn-icon-bg"><ion-icon name="document-text-outline"></ion-icon></div>
            <span>Historial de Reportes</span>
            <ion-icon name="chevron-forward-outline" class="btn-arrow"></ion-icon>
          </button>
          <button class="premium-action-btn logout-btn app-panel" (click)="logout()">
            <div class="btn-icon-bg"><ion-icon name="log-out-outline"></ion-icon></div>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-content { --background: var(--app-bg); }
    .profile-top-header .app-toolbar-shell { padding-bottom: 8px; }

    .profile-header-container {
      position: relative;
      background: linear-gradient(180deg, #0f6e56 0%, #1D9E75 55%, #38b98e 100%);
      padding: 52px 20px 56px;
      text-align: center;
      color: white;
      border-radius: 0 0 44px 44px;
      overflow: hidden;
      
      .header-overlay {
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        background: radial-gradient(circle at top right, rgba(255,255,255,0.22), rgba(255,255,255,0) 42%);
        opacity: 1;
      }
    }

    .avatar-section {
      position: relative; display: inline-block; margin-bottom: 20px;
      .avatar-glow {
        position: absolute; top: -8px; left: -8px; right: -8px; bottom: -8px;
        background: rgba(255,255,255,0.2); border-radius: 50%; filter: blur(10px);
      }
      .avatar, .avatar-img {
        width: 98px; height: 98px; border-radius: 32px; background: white;
        color: #1D9E75; display: flex; align-items: center; justify-content: center;
        font-size: 36px; font-weight: 800; border: 4px solid rgba(255,255,255,0.3);
        position: relative; z-index: 2; object-fit: cover;
        box-shadow: 0 18px 32px rgba(15,23,42,0.18);
      }
      .edit-avatar {
        position: absolute; bottom: 0; right: 0; width: 36px; height: 36px;
        background: white; border-radius: 14px; border: none; z-index: 3;
        color: #1D9E75; font-size: 18px; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      }
    }

    .user-name { font-size: 24px; font-weight: 800; margin: 0; z-index: 2; position: relative; }
    .user-email { font-size: 14px; opacity: 0.8; margin: 4px 0 20px; z-index: 2; position: relative; }

    .level-badge-premium {
      display: inline-flex; flex-direction: column; padding: 9px 22px; border-radius: 18px;
      z-index: 2; position: relative;
      box-shadow: 0 14px 28px rgba(15,23,42,0.16);
      .l-lvl { font-size: 10px; font-weight: 800; letter-spacing: 1px; opacity: 0.9; }
      .l-name { font-size: 14px; font-weight: 700; }
    }

    .profile-body { margin-top: -28px; z-index: 10; position: relative; padding-bottom: 110px; }

    .gamification-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 22px;
    }

    .premium-stat-card {
      border-radius: 22px; padding: 18px 10px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      .p-icon { width: 40px; height: 40px; border-radius: 14px; background: rgba(29,158,117,0.10); color: #1D9E75; display: flex; align-items: center; justify-content: center; font-size: 20px; }
      .p-info { text-align: center; }
      .p-val { font-size: 20px; font-weight: 800; color: var(--app-text-main); display: block; }
      .p-lab { font-size: 10px; font-weight: 700; color: var(--app-text-muted); text-transform: uppercase; }
    }

    .section-card {
      border-radius: 26px; padding: 22px; margin-bottom: 18px;
      .section-header {
        display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        .section-title { font-size: 16px; font-weight: 800; color: var(--app-text-main); margin: 0; }
        .progress-val { font-size: 14px; font-weight: 800; color: #1D9E75; }
        .action-link { background: none; border: none; color: #1D9E75; font-weight: 700; font-size: 13px; }
      }
    }

    .modern-progress-container {
      height: 10px; background: #edf2f7; border-radius: 20px; overflow: hidden; margin-bottom: 12px;
      .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #1D9E75, #34d399); border-radius: 20px; }
    }
    .progress-hint { font-size: 12px; color: var(--app-text-muted); margin: 0; text-align: center; }

    .streak-grid {
      display: flex; justify-content: space-between; padding: 10px 0;
      .day-item {
        display: flex; flex-direction: column; align-items: center; gap: 8px;
        .day-dot-container {
          width: 32px; height: 32px; border-radius: 50%; border: 2px solid #f1f5f9;
          display: flex; align-items: center; justify-content: center;
          .day-dot { width: 8px; height: 8px; background: #cbd5e1; border-radius: 50%; }
        }
        .day-name { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        &.active {
          .day-dot-container { border-color: #1D9E75; background: #ecfdf5; .day-dot { background: #1D9E75; } }
          .day-name { color: #1D9E75; }
        }
      }
    }

    .achievements-modern-list {
      display: flex; flex-direction: column; gap: 12px;
      .achievement-row {
        display: flex; align-items: center; gap: 14px; background: #f7faf9; padding: 12px; border-radius: 18px; border: 1px solid rgba(148,163,184,0.10);
        .a-icon-box { width: 44px; height: 44px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .a-info { flex: 1; .a-name { font-size: 14px; font-weight: 700; color: var(--app-text-main); display: block; } .a-desc { font-size: 11px; color: var(--app-text-muted); } }
        .a-medal { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; }
      }
    }

    .empty-ach-state {
      text-align: center;
      padding: 20px 10px 6px;
      .empty-icon { width: 54px; height: 54px; margin: 0 auto 12px; border-radius: 18px; background: rgba(29,158,117,0.08); color: #1D9E75; display: flex; align-items: center; justify-content: center; font-size: 26px; }
      p { margin: 0; font-size: 13px; color: var(--app-text-muted); font-weight: 600; }
    }

    .actions-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
    .premium-action-btn {
      width: 100%; height: 60px; border: none; border-radius: 20px;
      display: flex; align-items: center; padding: 0 16px; gap: 16px;
      transition: transform 0.2s;
      &:active { transform: scale(0.98); }
      .btn-icon-bg { width: 38px; height: 38px; background: #f3f7f7; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 18px; }
      span { flex: 1; text-align: left; font-size: 15px; font-weight: 700; color: var(--app-text-main); }
      .btn-arrow { color: #cbd5e1; }
      &.logout-btn { .btn-icon-bg { background: #fee2e2; color: #ef4444; } span { color: #ef4444; } }
    }

    .animate-up { animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
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
