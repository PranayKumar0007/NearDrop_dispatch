import React from 'react';
import type { Incident, IncidentStatus } from '../../types/dispatcher.types';
import { useNavigate } from 'react-router-dom';

interface ActionButtonsProps {
  incident: Incident;
  onResolve: (id: string) => void;
  onEscalate: (id: string) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ incident, onResolve, onEscalate }) => {
  const navigate = useNavigate();
  const isResolved = incident.status === 'Resolved';
  const isEscalated = incident.status === 'Escalated';

  const handleTrack = () => {
    // Navigate to map with this incident's coordinates stored in state
    navigate('/dispatcher/map', {
      state: { focusIncidentId: incident.id, coordinates: incident.coordinates },
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Track */}
      <button
        id={`btn-track-${incident.id}`}
        onClick={handleTrack}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-400"
        title={`Track ${incident.deliveryId} on map`}
      >
        Track
      </button>

      {/* Resolve */}
      <button
        id={`btn-resolve-${incident.id}`}
        onClick={() => onResolve(incident.id)}
        disabled={isResolved}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
          isResolved
            ? 'text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
            : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-400'
        }`}
        title={isResolved ? 'Already resolved' : `Resolve incident ${incident.id}`}
      >
        Resolve
      </button>

      {/* Escalate */}
      <button
        id={`btn-escalate-${incident.id}`}
        onClick={() => onEscalate(incident.id)}
        disabled={isEscalated || isResolved}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
          isEscalated || isResolved
            ? 'text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
            : 'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-400'
        }`}
        title={isEscalated ? 'Already escalated' : `Escalate incident ${incident.id}`}
      >
        Escalate
      </button>
    </div>
  );
};
