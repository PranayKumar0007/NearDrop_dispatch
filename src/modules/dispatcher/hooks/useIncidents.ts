/**
 * useIncidents.ts
 * ------------------------------------------------------------------
 * Custom hook for managing incident state.
 * V1: Initializes from mock data and manages local state.
 * V2: Replace initial load with fetchIncidents() API call,
 *     and subscribe to live updates via createDispatchSocket().
 * ------------------------------------------------------------------
 */

import { useState, useCallback } from 'react';
import type { Incident, IncidentStatus } from '../types/dispatcher.types';
import { mockIncidents } from '../data/dispatcherMockData';

interface UseIncidentsReturn {
  incidents: Incident[];
  updateStatus: (incidentId: string, status: IncidentStatus) => void;
  resolveIncident: (incidentId: string) => void;
  escalateIncident: (incidentId: string) => void;
  pendingCount: number;
  resolvedCount: number;
  escalatedCount: number;
}

export function useIncidents(): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

  /**
   * Generic status updater — keeps the list sorted with Pending items first.
   */
  const updateStatus = useCallback((incidentId: string, status: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((incident) =>
        incident.id === incidentId ? { ...incident, status } : incident
      )
    );
    // TODO V2: await updateIncidentStatus({ incidentId, status });
  }, []);

  const resolveIncident = useCallback(
    (incidentId: string) => updateStatus(incidentId, 'Resolved'),
    [updateStatus]
  );

  const escalateIncident = useCallback(
    (incidentId: string) => updateStatus(incidentId, 'Escalated'),
    [updateStatus]
  );

  const pendingCount = incidents.filter((i) => i.status === 'Pending').length;
  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;
  const escalatedCount = incidents.filter((i) => i.status === 'Escalated').length;

  return {
    incidents,
    updateStatus,
    resolveIncident,
    escalateIncident,
    pendingCount,
    resolvedCount,
    escalatedCount,
  };
}
