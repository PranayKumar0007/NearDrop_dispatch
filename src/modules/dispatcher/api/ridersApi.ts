import type { Rider, ApiResponse } from '../types/dispatcher.types';

/**
 * Mocking a REST backend for Riders
 */

// Simulated database
const mockRidersDB: Rider[] = [
  {
    id: 'DRV-001',
    name: 'Ravi Kumar',
    zone: 'Banjara Hills',
    score: 96,
    status: 'online',
    load: 1,
    etaToHub: 12,
    lastActiveTimestamp: new Date().toISOString(),
    idleSince: undefined,
    onDeliverySince: undefined,
    coordinates: { lat: 17.4156, lng: 78.4347 },
  },
  {
    id: 'DRV-002',
    name: 'Priya Sharma',
    zone: 'Jubilee Hills',
    score: 88,
    status: 'on-delivery',
    load: 3,
    currentTask: 'DEL-9921',
    etaToHub: 25,
    lastActiveTimestamp: new Date(Date.now() - 120000).toISOString(),
    onDeliverySince: new Date(Date.now() - 900000).toISOString(),
    coordinates: { lat: 17.4300, lng: 78.4050 },
  },
  {
    id: 'DRV-003',
    name: 'Abdul Rehman',
    zone: 'Madhapur',
    score: 92,
    status: 'idle',
    load: 0,
    etaToHub: 5,
    lastActiveTimestamp: new Date().toISOString(),
    idleSince: new Date(Date.now() - 1800000).toISOString(),
    coordinates: { lat: 17.4483, lng: 78.3915 },
  },
  {
    id: 'DRV-004',
    name: 'Sunita Reddy',
    zone: 'Gachibowli',
    score: 75,
    status: 'offline',
    load: 0,
    lastActiveTimestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const RidersApi = {
  getRealtimeFleet: async (): Promise<ApiResponse<Rider[]>> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    return {
      success: true,
      data: [...mockRidersDB],
    };
  },

  getRiderById: async (id: string): Promise<ApiResponse<Rider | null>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const rider = mockRidersDB.find((r) => r.id === id) || null;
    return {
      success: true,
      data: rider,
    };
  }
};
