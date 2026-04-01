import type { Incident, ApiResponse, IncidentStatus } from '../types/dispatcher.types';
import { mockIncidents } from '../data/dispatcherMockData';

/**
 * Mocking a REST backend for Incidents and Assigments
 */

// We clone the mock data locally to simulate an active DB
let activeDB: Incident[] = mockIncidents.map(inc => ({
  ...inc,
  // Ensure strict V2 Enum casting since in V1 it was "Pending"
  status: inc.status.toUpperCase() as IncidentStatus,
  severity: 'high',
  // Create a fake SLA deadline 30 minutes from timestamp
  slaDeadline: new Date(new Date(inc.timestamp).getTime() + 1800000).toISOString()
}));

export const IncidentsApi = {
  // Fetch the active queue
  getActiveIncidents: async (): Promise<ApiResponse<Incident[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return {
      success: true,
      data: activeDB.filter(inc => inc.status !== 'RESOLVED' && inc.status !== 'FAILED'),
    };
  },

  // Manual or Auto Assignment endpoint
  assignIncident: async (incidentId: string, riderId: string): Promise<ApiResponse<Incident>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const incidentIndex = activeDB.findIndex(inc => inc.id === incidentId);
    if (incidentIndex === -1) {
      return { success: false, data: {} as Incident, message: 'Incident not found' };
    }

    const updatedIncident = { 
      ...activeDB[incidentIndex], 
      assignedRiderId: riderId,
      status: 'ASSIGNED' as IncidentStatus
    };
    
    activeDB[incidentIndex] = updatedIncident;

    return {
      success: true,
      data: updatedIncident,
    };
  },

  // Resolve or Escalate endpoint
  updateIncidentStatus: async (incidentId: string, status: IncidentStatus): Promise<ApiResponse<Incident>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const incidentIndex = activeDB.findIndex(inc => inc.id === incidentId);
    if (incidentIndex === -1) {
      return { success: false, data: {} as Incident, message: 'Incident not found' };
    }

    const updatedIncident = { 
      ...activeDB[incidentIndex], 
      status 
    };
    
    activeDB[incidentIndex] = updatedIncident;

    return {
      success: true,
      data: updatedIncident,
    };
  }
};
