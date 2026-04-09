export type RouteStatus = 'active' | 'inactive';
export type RouteType   = 'collection' | 'sweeping';
export type AssignmentShift  = 'morning' | 'afternoon' | 'night';
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Route {
  id:          string;
  name:        string;
  description: string;
  zone:        string;
  type:        RouteType;
  status:      RouteStatus;
  color:       string;
  created_at:  string;
}

export interface Assignment {
  id:             string;
  assigned_date:  string;
  shift:          AssignmentShift;
  status:         AssignmentStatus;
  notes:          string;
  route_id:       string;
  route_name:     string;
  zone:           string;
  color:          string;
  vehicle_id:     string;
  plate:          string;
  driver_name:    string;
  latitude:       number | null;
  longitude:      number | null;
  vehicle_status: string;
}

export interface RoutesResponse {
  data:  Route[];
  total: number;
}

export interface AssignmentsResponse {
  data:  Assignment[];
  total: number;
  date:  string;
}

export interface CreateAssignmentPayload {
  route_id:      string;
  vehicle_id:    string;
  assigned_date: string;
  shift:         AssignmentShift;
  notes?:        string;
}
