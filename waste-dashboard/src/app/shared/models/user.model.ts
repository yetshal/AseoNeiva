export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  streak: number;
  level: number;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface UserDetail extends User {
  address: string;
}

export interface Report {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved';
  created_at: string;
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