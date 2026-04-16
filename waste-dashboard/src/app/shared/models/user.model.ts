export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  streak: number;
  level: number;
  status: 'active' | 'inactive' | 'pending';
  user_type: 'citizen' | 'driver' | 'collector' | 'sweeper' | 'admin';
  total_collections: number;
  total_reports: number;
  valid_reports: number;
  created_at: string;
}

export interface UserDetail extends User {
  address: string;
}

export type UserType = 'citizen' | 'driver' | 'collector' | 'sweeper' | 'admin';

export interface Report {
  id: string;
  type: string;
  description: string;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  created_at: string;
  validation?: {
    isValid: boolean;
    notes: string | null;
    validatedAt: string;
    validatedBy: string;
  } | null;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalPoints: number;
  totalReports: number;
}