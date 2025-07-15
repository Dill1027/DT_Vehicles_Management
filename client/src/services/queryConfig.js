import { QueryClient } from 'react-query';

// Optimized React Query configuration for better performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes to reduce API calls
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      // Retry failed requests with exponential backoff
      retry: (failureCount, error) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus but not too aggressively
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      // Automatically retry mutations once
      retry: 1,
    },
  },
});

// Custom query keys for consistent caching
export const queryKeys = {
  vehicles: {
    all: ['vehicles'],
    lists: () => [...queryKeys.vehicles.all, 'list'],
    list: (filters) => [...queryKeys.vehicles.lists(), { filters }],
    details: () => [...queryKeys.vehicles.all, 'detail'],
    detail: (id) => [...queryKeys.vehicles.details(), id],
  },
  dashboard: {
    all: ['dashboard'],
    summary: () => [...queryKeys.dashboard.all, 'summary'],
    stats: () => [...queryKeys.dashboard.all, 'stats'],
    alerts: () => [...queryKeys.dashboard.all, 'alerts'],
  },
  notifications: {
    all: ['notifications'],
    count: () => [...queryKeys.notifications.all, 'count'],
    lists: () => [...queryKeys.notifications.all, 'list'],
    list: (filters) => [...queryKeys.notifications.lists(), { filters }],
  },
  reports: {
    all: ['reports'],
    summary: () => [...queryKeys.reports.all, 'summary'],
  },
};

// Prefetch utility for dashboard data
export const prefetchDashboardData = async () => {
  const dashboardService = await import('./dashboardService');
  
  return queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: dashboardService.default.getDashboardSummary,
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard
  });
};

const queryConfig = { queryClient, queryKeys, prefetchDashboardData };

export default queryConfig;
