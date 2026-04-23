import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Level {
  id: number;
  level_number: number;
  title: string;
  description: string;
  points_required: number;
  icon: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface WeeklyStreak {
  day: string;
  completed: boolean;
}

export interface Collection {
  id: string;
  collectedAt: string;
  pointsEarned: number;
  verified: boolean;
  location?: { lat: number; lng: number };
}

export interface GamificationProfile {
  user: {
    id: string;
    name: string;
    email: string;
    points: number;
    streak: number;
    level: number;
    user_type: string;
    total_collections: number;
    total_reports: number;
    valid_reports: number;
    collection_schedule?: any[];
  };
  currentLevel: Level;
  nextLevel: Level | null;
  pointsToNextLevel: number;
  progressToNextLevel: number;
  achievements: Achievement[];
  weeklyStreak: WeeklyStreak[];
  recentCollections: Collection[];
}

export interface CollectionResponse {
  message: string;
  pointsEarned: number;
  streakBonus: number;
  newStreak: number;
  newTotalPoints: number;
  newLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private apiUrl = (environment as any).apiUrl;

  constructor(private http: HttpClient) {}

  getLevels(): Observable<Level[]> {
    return this.http.get<Level[]>(`${this.apiUrl}/gamification/levels`);
  }

  getGamificationProfile(): Observable<GamificationProfile> {
    return this.http.get<GamificationProfile>(`${this.apiUrl}/gamification/profile`);
  }

  registerCollection(location?: { latitude: number; longitude: number }): Observable<CollectionResponse> {
    return this.http.post<CollectionResponse>(`${this.apiUrl}/gamification/collection`, location || {});
  }

  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.apiUrl}/gamification/collections`);
  }

  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/gamification/leaderboard`);
  }

  getLevelTitle(level: number): string {
    const titles: { [key: number]: string } = {
      1: 'Novato',
      2: 'Intermedio',
      3: 'Avanzado',
      4: 'Experto',
      5: 'Master'
    };
    return titles[level] || 'Novato';
  }
}