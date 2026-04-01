import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LiveDispatchMap } from '../components/map/LiveDispatchMap';
import { mockMapMarkers } from '../data/dispatcherMockData';
// Routing imports removed

import type { Coordinates } from '../types/dispatcher.types';

interface LocationState {
  focusIncidentId?: string;
  coordinates?: Coordinates;
}

export const MapPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  // Track focus in local state to allow switching from side panel
  const [manualFocusId, setManualFocusId] = useState<string | undefined>(state?.focusIncidentId);
  const [manualCenter, setManualCenter] = useState<Coordinates | undefined>(state?.coordinates);

  const focusCenter = manualCenter;
  const focusIncidentId = manualFocusId;

  // Removed unused routes calculation

  const stats = React.useMemo(() => {
    return {
      drivers: mockMapMarkers.filter(m => m.type === 'driver').length,
      failed: mockMapMarkers.filter(m => m.type === 'failed_delivery').length,
      hubs: mockMapMarkers.filter(m => m.type === 'hub').length,
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Live Dispatch Map</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time driver positions, failed delivery points, and nearest hubs — Hyderabad Zone
          </p>
        </div>

        {/* Focus indicator */}
        {focusIncidentId && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-xs font-bold text-blue-700">Focused: {focusIncidentId}</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '🚗', label: 'Active Drivers', value: stats.drivers, color: '#3b82f6' },
          { icon: '📦', label: 'Failed Points', value: stats.failed, color: '#ef4444' },
          { icon: '🏢', label: 'Nearby Hubs', value: stats.hubs, color: '#10b981' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl px-4 py-3 shadow-sm border flex items-center gap-3" style={{ borderColor: '#e2e8f0' }}>
            <span className="text-xl">{icon}</span>
            <div>
              <p className="text-lg font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-slate-500 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map Panel */}
      <div className="flex gap-5" style={{ height: '540px' }}>
        {/* Map */}
        <LiveDispatchMap
          markers={mockMapMarkers}
          focusCenter={focusCenter}
          focusZoom={focusCenter ? 16 : 13}
          focusedIncidentId={focusIncidentId}
          className="flex-1"
        />

        {/* Marker List Panel */}
        <div className="w-64 bg-white rounded-2xl shadow-sm border p-4 flex flex-col gap-3 overflow-y-auto" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Active Markers</h3>
          {mockMapMarkers.map((marker) => {
            const isSelected = focusIncidentId === marker.id.replace('driver-', '').replace('failed-', '');
            const typeConfig = {
              driver: { color: '#3b82f6', icon: '🚗' },
              failed_delivery: { color: '#ef4444', icon: '📦' },
              hub: { color: '#10b981', icon: '🏢' },
            }[marker.type];

            return (
              <button
                key={marker.id}
                onClick={() => {
                  const incId = marker.id.replace('driver-', '').replace('failed-', '');
                  setManualFocusId(incId);
                  setManualCenter(marker.coordinates);
                }}
                className={`w-full text-left rounded-xl p-3 border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/80 shadow-md ring-1 ring-blue-200'
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{typeConfig.icon}</span>
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {marker.label}
                      {marker.deliveryId && <span className="text-slate-500 font-normal ml-1">({marker.deliveryId})</span>}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                      Tracking
                    </span>
                  )}
                </div>
                
                {marker.status && (
                  <div className="flex items-center gap-1.5 ml-6 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${marker.status === 'Resolved' ? 'bg-emerald-500' : marker.status === 'Escalated' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{marker.status}</p>
                  </div>
                )}

                {isSelected && marker.type !== 'hub' && (
                  <div className="ml-6 mb-2 mt-2 p-2 bg-white/60 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] text-slate-500">Estimated ETA</p>
                      <p className="text-[10px] font-bold text-blue-700">~6 mins</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-slate-500">Assigned Hub</p>
                      <p className="text-[10px] font-bold text-slate-700">{marker.assignedHubId?.replace('hub-', '') || 'NearDrop Hub'}</p>
                    </div>
                  </div>
                )}

                {!isSelected && marker.assignedHubId && (
                  <p className="text-[10px] text-slate-500 ml-6 mb-1">
                    Hub: <span className="font-semibold text-slate-700">{marker.assignedHubId.replace('hub-', '')}</span>
                  </p>
                )}
                
                {marker.description && (
                  <p className="text-[10px] text-slate-400 ml-6 leading-tight mb-1">{marker.description}</p>
                )}
                <p className="text-[10px] ml-6 font-mono font-bold" style={{ color: typeConfig.color }}>
                  {marker.coordinates.lat.toFixed(4)}°, {marker.coordinates.lng.toFixed(4)}°
                </p>
              </button>
            );
          })}

          <div className="mt-auto pt-3 border-t text-center" style={{ borderColor: '#f1f5f9' }}>
            <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">Live Sync Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};
