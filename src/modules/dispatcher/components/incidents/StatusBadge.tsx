import React from 'react';
import type { IncidentStatus } from '../../types/dispatcher.types';

interface StatusBadgeProps {
  status: IncidentStatus;
}

const statusConfig: Record<IncidentStatus, { label: string; bg: string; color: string; dot: string }> = {
  Pending: {
    label: 'Pending',
    bg: 'rgba(245,158,11,0.12)',
    color: '#d97706',
    dot: '#f59e0b',
  },
  Resolved: {
    label: 'Resolved',
    bg: 'rgba(16,185,129,0.12)',
    color: '#059669',
    dot: '#10b981',
  },
  Escalated: {
    label: 'Escalated',
    bg: 'rgba(239,68,68,0.12)',
    color: '#dc2626',
    dot: '#ef4444',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: config.dot }}
      />
      {config.label}
    </span>
  );
};
