import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.getCurrentUser();
  
  // Simulated data - in production would come from API
  estimatedMinutes = 12;
  estimatedMeters = 800;
  isTimeToTakeTrash = true;
  nextCollectionTime = '6:00 AM';
  currentPoints = 320;
  currentStreak = 14;
  recordStreak = 21;

  collectionSchedule = [
    { day: 'Lunes', time: '6:00 AM', zone: 'Norte' },
    { day: 'Miércoles', time: '6:00 AM', zone: 'Sur' },
    { day: 'Viernes', time: '6:00 AM', zone: 'Centro' }
  ];

  ngOnInit() {
    // Update user data from service
    this.user = this.auth.getCurrentUser();
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
