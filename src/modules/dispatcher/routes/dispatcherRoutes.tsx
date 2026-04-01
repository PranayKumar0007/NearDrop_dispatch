/**
 * dispatcherRoutes.tsx
 * ------------------------------------------------------------------
 * Modular route configuration for the Dispatcher Portal module.
 *
 * Mount these routes in the main application router:
 *
 *   import { dispatcherRoutes } from './modules/dispatcher/routes/dispatcherRoutes';
 *   // In your <Routes>:
 *   {dispatcherRoutes}
 *
 * Routes:
 *   /dispatcher           → Dashboard
 *   /dispatcher/incidents → Incident Queue
 *   /dispatcher/map       → Live Dispatch Map
 * ------------------------------------------------------------------
 */

import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { DispatcherShell } from '../components/layout/DispatcherShell';
import { DashboardPage } from '../pages/DashboardPage';
import { IncidentsPage } from '../pages/IncidentsPage';
import { MapPage } from '../pages/MapPage';

/**
 * Dispatcher route subtree.
 * Wrapped in DispatcherShell for layout.
 * Ready to be composed into a parent router.
 */
export const dispatcherRoutes = (
  <Route path="/dispatcher" element={<DispatcherShell />}>
    <Route index element={<DashboardPage />} />
    <Route path="incidents" element={<IncidentsPage />} />
    <Route path="map" element={<MapPage />} />
    {/* Fallback: redirect unknown sub-paths to dashboard */}
    <Route path="*" element={<Navigate to="/dispatcher" replace />} />
  </Route>
);
