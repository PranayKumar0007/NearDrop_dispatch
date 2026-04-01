// ─── Enums ───────────────────────────────────────────────────────────────────

export type IncidentStatus = 'Pending' | 'Resolved' | 'Escalated';

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Incident {
  id: string;
  deliveryId: string;
  driverId: string;
  location: string;
  coordinates: Coordinates;        // Failed delivery point
  driverCoordinates?: Coordinates; // Driver's current position (en route)
  timestamp: string;
  status: IncidentStatus;
  failureReason?: string;
}

// ─── KPI Dashboard ───────────────────────────────────────────────────────────

export type KPITrend = 'up' | 'down' | 'neutral';

export interface KPIStat {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend: KPITrend;
  trendValue?: string;
  icon: string;
}

// ─── Map ─────────────────────────────────────────────────────────────────────

export type MarkerType = 'driver' | 'failed_delivery' | 'hub';

export interface MapMarker {
  id: string;
  type: MarkerType;
  label: string;
  coordinates: Coordinates;
  description?: string;
}

// ─── API Service Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface UpdateIncidentPayload {
  incidentId: string;
  status: IncidentStatus;
}

// ─── WebSocket Types ─────────────────────────────────────────────────────────

export type SocketEventType = 'incident_created' | 'incident_updated' | 'driver_location_update';

export interface SocketEvent<T = unknown> {
  type: SocketEventType;
  payload: T;
  timestamp: string;
}
