import React from 'react';
import { useLocation } from 'react-router-dom';
import { LiveDispatchMap } from '../components/map/LiveDispatchMap';
import { mockMapMarkers } from '../data/dispatcherMockData';
import type { Coordinates } from '../types/dispatcher.types';

interface LocationState {
  focusIncidentId?: string;
  coordinates?: Coordinates;
}

export const MapPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  const focusCenter = state?.coordinates;
  const focusIncidentId = state?.focusIncidentId;

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
          { icon: '🚗', label: 'Active Drivers', value: '2', color: '#3b82f6' },
          { icon: '📦', label: 'Failed Points', value: '2', color: '#ef4444' },
          { icon: '🏢', label: 'Nearby Hubs', value: '2', color: '#10b981' },
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
          focusZoom={15}
          className="flex-1"
        />

        {/* Marker List Panel */}
        <div className="w-64 bg-white rounded-2xl shadow-sm border p-4 flex flex-col gap-3 overflow-y-auto" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Active Markers</h3>
          {mockMapMarkers.map((marker) => {
            const typeConfig = {
              driver: { color: '#3b82f6', icon: '🚗' },
              failed_delivery: { color: '#ef4444', icon: '📦' },
              hub: { color: '#10b981', icon: '🏢' },
            }[marker.type];

            return (
              <div
                key={marker.id}
                className="rounded-xl p-3 border hover:shadow-sm"
                style={{ borderColor: '#f1f5f9', background: '#fafafa' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{typeConfig.icon}</span>
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{marker.label}</p>
                </div>
                {marker.description && (
                  <p className="text-xs text-slate-400 ml-6 leading-tight">{marker.description}</p>
                )}
                <p className="text-xs mt-1 ml-6 font-mono" style={{ color: typeConfig.color }}>
                  {marker.coordinates.lat.toFixed(3)}°, {marker.coordinates.lng.toFixed(3)}°
                </p>
              </div>
            );
          })}

          <div className="mt-auto pt-3 border-t text-center" style={{ borderColor: '#f1f5f9' }}>
            <p className="text-xs text-slate-400">Route polylines in V2</p>
          </div>
        </div>
      </div>
    </div>
  );
};
