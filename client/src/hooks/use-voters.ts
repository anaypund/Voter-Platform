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
      const rawData = await res.json();
      console.log("Raw API response for", params.query, ":", rawData);
      console.log("Response count:", Array.isArray(rawData) ? rawData.length : "Not an array");
      
      try {
        const parsed = api.voters.search.responses[200].parse(rawData);
        console.log("Parsed successfully:", parsed.length, "voters");
        return parsed;
      } catch (error: any) {
        console.error("Zod validation failed:", error.message);
        console.error("Full error:", error);
        // Still try to return the raw data so something shows up
        if (Array.isArray(rawData)) {
          console.log("Returning raw data without validation");
          return rawData;
        }
        throw error;
      }
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
      
      // Check if device is mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile: open in new tab/window (native print will work)
          const a = document.createElement("a");
          a.href = pdfUrl;
          a.download = "voter-slip.pdf";   // name user will see
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(pdfUrl);
      } else {
        // On desktop: use iframe for direct print dialog
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfUrl;
        document.body.appendChild(iframe);
        
        // Wait for iframe to load then trigger print
        iframe.onload = () => {
          iframe.contentWindow?.print();
          // Clean up after print dialog closes
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(pdfUrl);
          }, 500);
        };
      }
      
      return true;
    },
  });
}

export function useShareSlip() {
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
      
      // Check if Web Share API is available (modern browsers, especially mobile)
      if (navigator.share && navigator.canShare({ files: [new File([blob], "voter-slip.pdf", { type: "application/pdf" })] })) {
        try {
          const file = new File([blob], "voter-slip.pdf", { type: "application/pdf" });
          await navigator.share({
            files: [file],
            title: "Voter Slip",
            text: "Please find the voter slip attached",
          });
          return true;
        } catch (error: any) {
          // User cancelled the share or error occurred
          if (error.name !== "AbortError") {
            console.error("Share failed:", error);
          }
          return false;
        }
      } else {
        // Fallback: Create download link for browsers that don't support native sharing
        const pdfUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `voter-slip-${voterId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 100);
        return true;
      }
    },
  });
}
