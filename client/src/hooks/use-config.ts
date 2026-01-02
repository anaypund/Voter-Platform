import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertAppConfig } from "@shared/routes";

export function useAppConfig() {
  return useQuery({
    queryKey: [api.config.get.path],
    queryFn: async () => {
      const res = await fetch(api.config.get.path);
      if (!res.ok) throw new Error("Failed to fetch config");
      return api.config.get.responses[200].parse(await res.json());
    },
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
      });
      if (!res.ok) throw new Error("Failed to update config");
      return api.config.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.config.get.path] });
    },
  });
}
