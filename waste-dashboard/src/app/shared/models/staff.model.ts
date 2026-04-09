export type AdminRole = 'superadmin' | 'admin' | 'operator';

export interface StaffMember {
  id:         string;
  name:       string;
  email:      string;
  role:       AdminRole;
  is_active:  boolean;
  created_at: string;
}

export interface StaffResponse {
  data:  StaffMember[];
  total: number;
  page:  number;
  limit: number;
}

export interface CreateStaffPayload {
  name:     string;
  email:    string;
  password: string;
  role:     AdminRole;
}

export interface UpdateStaffPayload {
  name?:      string;
  email?:     string;
  role?:      AdminRole;
  is_active?: boolean;
}
