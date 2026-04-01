/**
 * dispatcherMockData.ts
 * ------------------------------------------------------------------
 * Centralized mock data layer for the Dispatcher Portal V1.
 *
 * ARCHITECTURE NOTE — Why markers are derived, not hand-written:
 * ----------------------------------------------------------------
 * Previously, mockMapMarkers was a separate array where coordinates
 * were manually typed to match incidents. This caused a Banjara Hills
 * / Secunderabad mismatch: the incident was correctly in Secunderabad,
 * but the map marker was accidentally copy-pasted with Banjara Hills
 * coordinates. The two lists silently diverged.
 *
 * FIX: `mockMapMarkers` is now DERIVED from `mockIncidents`.
 *   - failed_delivery markers use incident.coordinates (single source)
 *   - driver markers use incident.driverCoordinates (stored on incident)
 *   - hub markers remain a static list (infrastructure, not per-incident)
 *
 * Adding a new incident automatically appears on the map correctly.
 * There is no second place to update. Drift is structurally impossible.
 * ------------------------------------------------------------------
 */

import type { Incident, KPIStat, MapMarker } from '../types/dispatcher.types';

// ─── Mock Incidents (single source of truth for all coordinates) ──────────────
//
// Each incident owns:
//   coordinates        → exact failed delivery point (drives the map pin)
//   driverCoordinates  → driver's current position (drives the driver pin)
//
// Do NOT duplicate coordinates anywhere else.

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    deliveryId: 'DEL-2048',
    driverId: 'DRV-078',
    location: 'Banjara Hills, Hyderabad',
    coordinates:       { lat: 17.4102, lng: 78.4482 },
    driverCoordinates: { lat: 17.4160, lng: 78.4410 },
    timestamp: '2026-04-01T09:12:00Z',
    status: 'Pending',
    failureReason: 'Customer not available',
  },
  {
    id: 'INC-002',
    deliveryId: 'DEL-2051',
    driverId: 'DRV-042',
    location: 'Jubilee Hills, Hyderabad',
    coordinates:       { lat: 17.4325, lng: 78.4071 },
    driverCoordinates: { lat: 17.4450, lng: 78.4100 },
    timestamp: '2026-04-01T08:45:00Z',
    status: 'Escalated',
    failureReason: 'Wrong address provided',
  },
  {
    id: 'INC-003',
    deliveryId: 'DEL-2039',
    driverId: 'DRV-015',
    location: 'Gachibowli, Hyderabad',
    coordinates:       { lat: 17.4401, lng: 78.3489 },
    driverCoordinates: { lat: 17.4430, lng: 78.3520 },
    timestamp: '2026-04-01T08:20:00Z',
    status: 'Resolved',
    failureReason: 'Package damaged in transit',
  },
  {
    id: 'INC-004',
    deliveryId: 'DEL-2062',
    driverId: 'DRV-091',
    location: 'Kondapur, Hyderabad',
    coordinates:       { lat: 17.4600, lng: 78.3626 },
    driverCoordinates: { lat: 17.4650, lng: 78.3680 },
    timestamp: '2026-04-01T09:30:00Z',
    status: 'Pending',
    failureReason: 'Delivery address locked',
  },
  {
    id: 'INC-005',
    deliveryId: 'DEL-2075',
    driverId: 'DRV-033',
    location: 'Madhapur, Hyderabad',
    coordinates:       { lat: 17.4485, lng: 78.3908 },
    driverCoordinates: { lat: 17.4510, lng: 78.3950 },
    timestamp: '2026-04-01T07:58:00Z',
    status: 'Resolved',
    failureReason: 'Package refused by recipient',
  },
  {
    id: 'INC-006',
    deliveryId: 'DEL-2081',
    driverId: 'DRV-056',
    location: 'Kukatpally, Hyderabad',
    coordinates:       { lat: 17.4849, lng: 78.4138 },
    driverCoordinates: { lat: 17.4900, lng: 78.4180 },
    timestamp: '2026-04-01T10:05:00Z',
    status: 'Pending',
    failureReason: 'Driver vehicle breakdown',
  },
  {
    id: 'INC-007',
    deliveryId: 'DEL-2094',
    driverId: 'DRV-022',
    location: 'Secunderabad, Hyderabad',
    coordinates:       { lat: 17.4399, lng: 78.4983 },
    driverCoordinates: { lat: 17.4480, lng: 78.5050 },
    timestamp: '2026-04-01T09:50:00Z',
    status: 'Escalated',
    failureReason: 'Attempted 3 times, no response',
  },
  {
    id: 'INC-008',
    deliveryId: 'DEL-2103',
    driverId: 'DRV-067',
    location: 'LB Nagar, Hyderabad',
    coordinates:       { lat: 17.3483, lng: 78.5481 },
    driverCoordinates: { lat: 17.3530, lng: 78.5520 },
    timestamp: '2026-04-01T10:15:00Z',
    status: 'Pending',
    failureReason: 'Gate locked, no intercom',
  },
];

// ─── Mock KPI Stats ───────────────────────────────────────────────────────────

export const mockKPIStats: KPIStat[] = [
  {
    id: 'kpi-1',
    label: 'Active Deliveries',
    value: 248,
    trend: 'up',
    trendValue: '+12 from yesterday',
    icon: '🚚',
  },
  {
    id: 'kpi-2',
    label: 'Pending Incidents',
    value: 4,
    trend: 'down',
    trendValue: '-2 from 1h ago',
    icon: '⚠️',
  },
  {
    id: 'kpi-3',
    label: 'Resolved Today',
    value: 31,
    trend: 'up',
    trendValue: '+8 vs yesterday',
    icon: '✅',
  },
  {
    id: 'kpi-4',
    label: 'Avg Resolution Time',
    value: '14',
    unit: 'min',
    trend: 'down',
    trendValue: '-3 min improvement',
    icon: '⏱️',
  },
];

// ─── Static Hub Locations (infrastructure — not per-incident) ─────────────────
//
// Hubs are fixed locations. They are the only markers typed by hand here,
// because they represent physical infrastructure, not dynamic incidents.

const mockHubs: MapMarker[] = [
  {
    id: 'hub-secunderabad',
    type: 'hub',
    label: 'NearDrop Hub — Secunderabad',
    coordinates: { lat: 17.4520, lng: 78.4870 },
    description: 'Nearest hub — Secunderabad zone',
  },
  {
    id: 'hub-madhapur',
    type: 'hub',
    label: 'NearDrop Hub — Madhapur',
    coordinates: { lat: 17.4490, lng: 78.3920 },
    description: 'Secondary hub — Madhapur zone',
  },
];

// ─── Derived Map Markers (auto-generated from incidents) ──────────────────────
//
// Only active (Pending / Escalated) incidents appear on the map.
// Coordinates come directly from each incident — no manual re-entry.
//
// To add a new incident to the map: add it to mockIncidents above.
// To remove it: change its status to 'Resolved'.
// You never need to touch this block.

const ACTIVE_STATUSES: Incident['status'][] = ['Pending', 'Escalated'];

function deriveMarkersFromIncidents(incidents: Incident[]): MapMarker[] {
  const active = incidents.filter((i) => ACTIVE_STATUSES.includes(i.status));

  const failedMarkers: MapMarker[] = active.map((i) => ({
    id: `failed-${i.id}`,
    type: 'failed_delivery',
    label: `Failed Delivery ${i.deliveryId}`,
    coordinates: i.coordinates, // ← directly from incident, never duplicated
    description: `${i.failureReason ?? 'Delivery failed'} — ${i.location}`,
  }));

  const driverMarkers: MapMarker[] = active
    .filter((i) => i.driverCoordinates != null)
    .map((i) => ({
      id: `driver-${i.id}`,
      type: 'driver',
      label: `Driver ${i.driverId}`,
      coordinates: i.driverCoordinates!,
      description: `Handling ${i.deliveryId} — ${i.location}`,
    }));

  return [...driverMarkers, ...failedMarkers, ...mockHubs];
}

export const mockMapMarkers: MapMarker[] = deriveMarkersFromIncidents(mockIncidents);

// ─── Map Default Center (Hyderabad) ──────────────────────────────────────────

export const MAP_DEFAULT_CENTER = { lat: 17.4300, lng: 78.4400 };
export const MAP_DEFAULT_ZOOM = 12;
