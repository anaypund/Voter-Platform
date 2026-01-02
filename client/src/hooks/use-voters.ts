import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Voter, SearchVotersRequest } from "@shared/schema";

// Helper to construct query string
const buildSearchUrl = (params: SearchVotersRequest) => {
  const urlParams = new URLSearchParams();
  urlParams.append("type", params.type);
  urlParams.append("query", params.query);
  if (params.subQuery) urlParams.append("subQuery", params.subQuery);
  
  return `${api.voters.search.path}?${urlParams.toString()}`;
};

export function useVoterSearch(params: SearchVotersRequest | null) {
  return useQuery({
    queryKey: [api.voters.search.path, params],
    queryFn: async () => {
      if (!params) return [];
      const res = await fetch(buildSearchUrl(params));
      if (!res.ok) throw new Error("Failed to fetch voters");
      return api.voters.search.responses[200].parse(await res.json());
    },
    enabled: !!params && params.query.length > 0,
  });
}

export function useVoter(id: string) {
  return useQuery({
    queryKey: [api.voters.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.voters.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Voter not found");
      return api.voters.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function usePrintSlip() {
  return useMutation({
    mutationFn: async ({ voterId, lang }: { voterId: string; lang?: string }) => {
      const url = buildUrl(api.voters.printSlip.path, { id: voterId });
      const res = await fetch(url, {
        method: api.voters.printSlip.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lang }),
      });
      
      if (!res.ok) throw new Error("Failed to generate slip");
      
      // Handle binary PDF data
      const blob = await res.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      
      // Open in new tab or trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.download = `voter-slip-${voterId}.pdf`; // Optional: sets a default filename
      // For immediate open in new tab:
      window.open(pdfUrl, '_blank');
      
      // Clean up
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 1000);
      
      return true;
    },
  });
}
