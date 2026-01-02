import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertAppConfig } from "@shared/schema";

export function useAppConfig() {
  return useQuery({
    queryKey: [api.config.get.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.config.get.path, {
          credentials: "include",
        });
        if (!res.ok) {
          // Return default config if fetch fails
          return {
            partyName: "Election Platform",
            themeColor: "#ff9933",
            footerMessage: "Vote for Progress!",
            isPublicAccess: false,
            printTemplate: "default",
          };
        }
        const data = await res.json();
        return data || {};
      } catch (error) {
        // Return default config on error
        return {
          partyName: "Election Platform",
          themeColor: "#ff9933",
          footerMessage: "Vote for Progress!",
          isPublicAccess: false,
          printTemplate: "default",
        };
      }
    },
    retry: false,
    staleTime: 0, // Always consider data as stale so it refetches when component mounts
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes for performance
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAppConfig) => {
      const res = await fetch(api.config.update.path, {
        method: api.config.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update config");
      return api.config.update.responses[200].parse(await res.json());
    },
    onSuccess: (newConfig) => {
      // Immediately update the cache with the new config
      queryClient.setQueryData([api.config.get.path], newConfig);
      // Also invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: [api.config.get.path] });
    },
  });
}
