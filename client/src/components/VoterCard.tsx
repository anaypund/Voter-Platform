import { Voter } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Printer, User, MapPin, Share2 } from "lucide-react";
import { usePrintSlip, useShareSlip } from "@/hooks/use-voters";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VoterCardProps {
  voter: Voter;
  themeColor?: string;
}

export function VoterCard({ voter, themeColor }: VoterCardProps) {
  const printSlip = usePrintSlip();
  const shareSlip = useShareSlip();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // DEBUG: Log voter data to see what fields are actually available
  // console.log("VoterCard received voter data:", voter);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printSlip.mutateAsync({ voterId: voter._id || "", lang: "hi" });
    } catch (error) {
      console.error("Print failed", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareSlip.mutateAsync({ voterId: voter._id || "", lang: "hi" });
    } catch (error) {
      console.error("Share failed", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4" style={{ borderLeftColor: themeColor || "var(--primary)" }}>
      <CardHeader className="bg-secondary/30 p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-foreground font-display">{voter.Name}</h3>
            <p className="text-sm text-muted-foreground">INDEX: <span className="font-mono font-medium text-primary">{voter.Index}</span> &nbsp;&nbsp;&nbsp; EPIC: <span className="font-mono font-medium text-primary">{voter.epic_no}</span></p>
          </div>
          <div className="bg-background rounded-full p-2 border shadow-sm">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs uppercase tracking-wider">Gender</span>
            <span className="font-medium">{voter.Gender}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs uppercase tracking-wider">Age</span>
            <span className="font-medium">{voter.Age}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs uppercase tracking-wider">Relation Name</span>
            <span className="font-medium">{voter["Husband Name"] || voter["Father Name"] || "N/A"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs uppercase tracking-wider">House Number</span>
            <span className="font-medium">{voter["House Number"]}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-dashed">
           <div className="flex items-start gap-2 text-sm text-muted-foreground">
             <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
             <div className="flex-1">
               {voter["ward"] && <p className="line-clamp-2">{voter["ward"]}</p>}
               {!voter["ward"] && <p className="text-xs text-red-500">Ward data missing</p>}
             </div>
           </div>
           <p className="mt-1 text-xs text-muted-foreground pl-6">Booth: {voter.booth || "N/A"}</p>
           <p className="mt-1 text-xs text-muted-foreground pl-6">यादि भाग क्र. {voter.Yaadi_bhaag_kr || "N/A"}: {voter.Yaadi_bhaag_address || "N/A"}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/20 border-t flex gap-2">
        <Button 
          onClick={handlePrint} 
          disabled={isPrinting || isSharing}
          className="flex-1 gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ backgroundColor: themeColor, borderColor: themeColor }}
        >
          {isPrinting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              Print
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleShare} 
          disabled={isSharing || isPrinting}
          className="flex-1 gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ backgroundColor: themeColor, borderColor: themeColor }}
        >
          {isSharing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
