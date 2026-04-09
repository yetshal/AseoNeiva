export interface SummaryData {
  users: {
    total:  number;
    active: number;
    points: number;
  };
  reports: {
    total:    number;
    pending:  number;
    resolved: number;
    byType:   { type: string; count: string }[];
  };
  fleet: {
    total:       number;
    active:      number;
    fuelUsed:    number;
    distanceKm:  number;
    fuelSaved:   number;
    collections: number;
  };
  topUsers: {
    id:     string;
    name:   string;
    points: number;
    level:  number;
    streak: number;
  }[];
}
