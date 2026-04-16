import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GamificationService, GamificationProfile, WeeklyStreak, Achievement, Collection } from '../../services/gamification.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header [translucent]="true" class="page-header">
      <ion-toolbar>
        <div class="header-content">
          <span class="header-title">Perfil</span>
          <button class="settings-btn" (click)="goToSettings()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="profile-content">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar">{{ getUserInitials() }}</div>
          <button class="edit-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        </div>
        <h1 class="user-name">{{ user?.name || 'Usuario' }}</h1>
        <span class="user-email">{{ user?.email || 'correo@email.com' }}</span>
      </div>

      <!-- Gamification Stats -->
      <div class="gamification-section">
        <div class="stat-card">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{{ user?.points || 320 }}</span>
          <span class="stat-label">Puntos</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🔥</span>
          <span class="stat-value">{{ user?.streak || 14 }}</span>
          <span class="stat-label">Racha</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏆</span>
          <span class="stat-value">{{ achievements }}</span>
          <span class="stat-label">Logros</span>
        </div>
      </div>

      <!-- Level Progress -->
      <div class="level-section">
        <div class="level-header">
          <div class="level-info">
            <span class="level-badge">Nivel {{ user?.level || 3 }}</span>
            <span class="level-title">{{ getLevelTitle() }}</span>
          </div>
          <span class="level-next">{{ pointsToNextLevel }} pts para siguiente nivel</span>
        </div>
        <div class="level-progress">
          <div class="progress-fill" [style.width.%]="progressToNextLevel"></div>
        </div>
      </div>

      <!-- Weekly Streak -->
      <div class="streak-section">
        <h2 class="section-title">Racha semanal</h2>
        <div class="streak-days">
          @for (day of weeklyStreak; track day.day) {
            <div class="day-item" [class.active]="day.completed">
              <span class="day-name">{{ day.day }}</span>
              <div class="day-indicator">
                @if (day.completed) {
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Achievements -->
      <div class="achievements-section">
        <div class="section-header">
          <h2 class="section-title">Logros</h2>
          <button class="see-more">Ver más →</button>
        </div>
        <div class="achievements-list">
          @for (achievement of achievementsList; track achievement.id) {
            <div class="achievement-item" [class.locked]="!achievement.unlocked">
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <span class="achievement-name">{{ achievement.name }}</span>
                <span class="achievement-desc">{{ achievement.description }}</span>
              </div>
              @if (achievement.unlocked) {
                <span class="achievement-badge">✓</span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="actions-section">
        <button class="action-btn" (click)="goToSettings()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4"/>
          </svg>
          <span>Configuración</span>
        </button>
        <button class="action-btn" (click)="goToHistory()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Historial de recolección</span>
        </button>
        <button class="action-btn logout" (click)="logout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Cerrar sesión</span>
        </button>
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

    .settings-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #f0f0ed;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      svg { width: 18px; height: 18px; color: #666; }
    }

    .profile-content {
      --background: #f9f9f7;
      --padding-top: 8px;
    }

    .profile-header {
      text-align: center;
      padding: 24px 16px;
      background: linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%);
      color: white;
    }

    .avatar-section {
      position: relative;
      display: inline-block;
      margin-bottom: 16px;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 600;
      border: 3px solid rgba(255,255,255,0.3);
    }

    .edit-avatar {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);

      svg { width: 14px; height: 14px; color: #666; }
    }

    .user-name {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 4px;
    }

    .user-email {
      font-size: 14px;
      opacity: 0.8;
    }

    .gamification-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding: 16px;
      margin: -20px 16px 16px;
      background: white;
      border-radius: 16px;
      position: relative;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .stat-icon { font-size: 24px; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1a1a; }
    .stat-label { font-size: 11px; color: #999; }

    .level-section {
      margin: 0 16px 16px;
      padding: 16px;
      background: white;
      border-radius: 12px;
    }

    .level-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .level-info { display: flex; align-items: center; gap: 8px; }

    .level-badge {
      font-size: 12px;
      padding: 3px 10px;
      background: #1D9E75;
      color: white;
      border-radius: 20px;
      font-weight: 500;
    }

    .level-title { font-size: 14px; font-weight: 600; }

    .level-next { font-size: 12px; color: #999; }

    .level-progress {
      height: 8px;
      background: #f0f0ed;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #1D9E75, #0F6E56);
      border-radius: 4px;
      transition: width 0.3s;
    }

    .streak-section {
      margin: 0 16px 16px;
      padding: 16px;
      background: white;
      border-radius: 12px;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 12px;
    }

    .streak-days {
      display: flex;
      justify-content: space-between;
    }

    .day-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .day-name { font-size: 11px; color: #999; }

    .day-indicator {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f0f0ed;
      display: flex;
      align-items: center;
      justify-content: center;

      .active & {
        background: #E1F5EE;
        color: #0F6E56;
      }

      svg { width: 18px; height: 18px; }
    }

    .achievements-section {
      margin: 0 16px 16px;
      padding: 16px;
      background: white;
      border-radius: 12px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .section-title { margin: 0; }
    }

    .see-more {
      background: none;
      border: none;
      color: #1D9E75;
      font-size: 13px;
      cursor: pointer;
    }

    .achievements-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .achievement-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9f9f7;
      border-radius: 10px;

      &.locked {
        opacity: 0.5;
        .achievement-icon { filter: grayscale(1); }
      }
    }

    .achievement-icon {
      font-size: 28px;
    }

    .achievement-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .achievement-name {
      font-size: 14px;
      font-weight: 500;
    }

    .achievement-desc {
      font-size: 12px;
      color: #888;
    }

    .achievement-badge {
      color: #1D9E75;
      font-weight: 600;
    }

    .actions-section {
      padding: 16px;
      padding-bottom: 40px;
    }

    .action-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: white;
      border: none;
      border-radius: 12px;
      margin-bottom: 8px;
      cursor: pointer;

      svg { width: 20px; height: 20px; color: #666; }
      span { font-size: 14px; color: #333; }

      &.logout {
        margin-top: 16px;
        border: 1px solid #ebebeb;

        svg { color: #D85A30; }
        span { color: #D85A30; }
      }
    }
  `]
})
export class ProfilePage implements OnInit {
  private auth = inject(AuthService);
  private gamification = inject(GamificationService);
  private router = inject(Router);

  user: User | null = this.auth.getCurrentUser();
  
  gamificationData: GamificationProfile | null = null;
  achievements = 0;
  pointsToNextLevel = 0;
  progressToNextLevel = 0;
  weeklyStreak: WeeklyStreak[] = [];
  achievementsList: Achievement[] = [];

  ngOnInit() {
    this.loadGamificationData();
  }

  loadGamificationData() {
    this.gamification.getGamificationProfile().subscribe({
      next: (data) => {
        this.gamificationData = data;
        this.achievements = data.achievements.filter(a => a.unlocked).length;
        this.pointsToNextLevel = data.pointsToNextLevel;
        this.progressToNextLevel = data.progressToNextLevel;
        this.weeklyStreak = data.weeklyStreak;
        this.achievementsList = data.achievements;
        
        if (this.user) {
          this.user.points = data.user.points;
          this.user.streak = data.user.streak;
          this.user.level = data.user.level;
        }
      },
      error: (err) => {
        console.error('Error loading gamification:', err);
        this.initDefaultData();
      }
    });
  }

  initDefaultData() {
    this.pointsToNextLevel = 80;
    this.progressToNextLevel = 75;
    this.weeklyStreak = [
      { day: 'Lun', completed: true },
      { day: 'Mar', completed: true },
      { day: 'Mié', completed: true },
      { day: 'Jue', completed: true },
      { day: 'Vie', completed: false },
      { day: 'Sáb', completed: false },
      { day: 'Dom', completed: false }
    ];
    this.achievementsList = [
      { id: 1, name: 'Primer paso', description: 'Saca la basura por primera vez', icon: '🌱', points_reward: 10, unlocked: true },
      { id: 2, name: 'Semana completa', description: '7 días consecutivos', icon: '📅', points_reward: 50, unlocked: true },
      { id: 3, name: 'Mes de racha', description: '30 días consecutivos', icon: '🔥', points_reward: 200, unlocked: true },
      { id: 4, name: 'Reportero', description: 'Realiza 5 reportes', icon: '📱', points_reward: 30, unlocked: true },
      { id: 5, name: 'Vecino ejemplares', description: 'Invita 3 amigos', icon: '👥', points_reward: 100, unlocked: false }
    ];
    this.achievements = this.achievementsList.filter(a => a.unlocked).length;
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user!.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase();
  }

  getLevelTitle(): string {
    const level = this.user?.level || 1;
    if (level >= 5) return 'Master';
    if (level >= 4) return 'Experto';
    if (level >= 3) return 'Avanzado';
    if (level >= 2) return 'Intermedio';
    return 'Novato';
  }

  goToSettings() {
    this.router.navigate(['/tabs/settings']);
  }

  goToHistory() {
    // Navigate to collection history
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
