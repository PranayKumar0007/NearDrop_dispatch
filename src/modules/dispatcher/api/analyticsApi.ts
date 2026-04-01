import type { ApiResponse } from '../types/dispatcher.types';
import type { LeaderboardEntry, FailureZone } from '../store/analyticsStore';

/**
 * Mocking a REST backend for BI and Analytics
 */

export const AnalyticsApi = {
  getLeaderboard: async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      success: true,
      data: [
        { riderId: 'DRV-001', name: 'Ravi Kumar', score: 96, completedDeliveries: 142 },
        { riderId: 'DRV-014', name: 'Vikram Singh', score: 94, completedDeliveries: 120 },
        { riderId: 'DRV-003', name: 'Abdul Rehman', score: 92, completedDeliveries: 105 },
      ],
    };
  },

  getFailureZones: async (): Promise<ApiResponse<FailureZone[]>> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      data: [
        { zone: 'Banjara Hills', failedCount: 14, riskLevel: 'high' },
        { zone: 'Jubilee Hills', failedCount: 8, riskLevel: 'medium' },
        { zone: 'Madhapur', failedCount: 2, riskLevel: 'low' },
      ],
    };
  },

  getGlobalMetrics: async (): Promise<ApiResponse<{ avgResTime: number; breachCount: number; rerouteSuccess: number; }>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        avgResTime: 4.2,      // e.g. 4.2 minutes
        breachCount: 12,      // SLAs broken today
        rerouteSuccess: 84.5, // %
      },
    };
  },
};
