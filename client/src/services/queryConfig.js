import { QueryClient } from 'react-query';

// Optimized React Query configuration for better performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Increase cache time to reduce API calls
      staleTime: 3 * 60 * 1000, // 3 minutes before considering data stale
      cacheTime: 15 * 60 * 1000, // 15 minutes before garbage collection
      // Retry failed requests with exponential backoff
      retry: (failureCount, error) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 2; // Reduced from 3 to 2
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Disable aggressive refetching to improve performance
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Changed from true to false
      refetchOnReconnect: true,
      // Add network throttling
      networkMode: 'online',
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
