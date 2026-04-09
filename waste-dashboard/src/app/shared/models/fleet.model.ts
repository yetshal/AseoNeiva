export type VehicleStatus = 'active' | 'out_of_service' | 'maintenance';
export type VehicleType   = 'truck' | 'sweeper' | 'compactor';

export interface Vehicle {
  id:           string;
  plate:        string;
  model:        string;
  type:         VehicleType;
  status:       VehicleStatus;
  driver_name:  string;
  driver_phone: string;
  fuel_capacity:number;
  latitude:     number | null;
  longitude:    number | null;
  last_seen_at: string | null;
  created_at:   string;
}

export interface VehicleAssignment {
  id:           string;
  assigned_date:string;
  shift:        string;
  status:       string;
  notes:        string;
  route_name:   string;
  zone:         string;
}

export interface VehicleDetail {
  vehicle:     Vehicle;
  assignments: VehicleAssignment[];
  logs:        VehicleLog[];
}

export interface VehicleLog {
  collected_at: string;
  fuel_used:    number;
  distance_km:  number;
  route_name:   string;
}

export interface FleetResponse {
  data:  Vehicle[];
  total: number;
}
