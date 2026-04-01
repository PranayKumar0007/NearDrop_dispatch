/**
 * api.ts — NearDrop Dispatcher API Service Layer (V1 Placeholder)
 * ------------------------------------------------------------------
 * Currently returns mock data. In V2, replace with real HTTP calls
 * to the FastAPI backend.
 *
 * Base URL and auth headers should be configured via env vars:
 *   VITE_API_BASE_URL
 *   VITE_API_KEY
 * ------------------------------------------------------------------
 */

import { mockIncidents } from '../data/dispatcherMockData';
import type { ApiResponse, Incident, IncidentStatus, UpdateIncidentPayload } from '../types/dispatcher.types';

// TODO V2: const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

/**
 * Fetch all incidents from the backend.
 * V1: Returns mock data with simulated network delay.
 */
export async function fetchIncidents(): Promise<ApiResponse<Incident[]>> {
  await simulateDelay(300);
  return {
    success: true,
    data: mockIncidents,
  };
}

/**
 * Update the status of a single incident.
 * V1: Resolves immediately (state managed in useIncidents hook).
 */
export async function updateIncidentStatus(
  payload: UpdateIncidentPayload
): Promise<ApiResponse<{ incidentId: string; status: IncidentStatus }>> {
  await simulateDelay(200);
  console.info('[API] updateIncidentStatus:', payload);
  return {
    success: true,
    data: { incidentId: payload.incidentId, status: payload.status },
    message: 'Incident status updated successfully.',
  };
}

/**
 * Utility: simulate network latency for realistic mock behavior.
 */
function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
