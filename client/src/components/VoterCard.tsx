import { Voter } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Printer, User, MapPin } from "lucide-react";
import { usePrintSlip } from "@/hooks/use-voters";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VoterCardProps {
  voter: Voter;
  themeColor?: string;
}

export function VoterCard({ voter, themeColor }: VoterCardProps) {
  const printSlip = usePrintSlip();
  const [isPrinting, setIsPrinting] = useState(false);

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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4" style={{ borderLeftColor: themeColor || "var(--primary)" }}>
      <CardHeader className="bg-secondary/30 p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-foreground font-display">{voter.Name}</h3>
            <p className="text-sm text-muted-foreground">EPIC: <span className="font-mono font-medium text-primary">{voter.epic_no}</span></p>
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
          <div className="col-span-2">
            <span className="text-muted-foreground block text-xs uppercase tracking-wider">Relation Name</span>
            <span className="font-medium">{voter["Husband Name"]}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-dashed">
           <div className="flex items-start gap-2 text-sm text-muted-foreground">
             <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
             <p className="line-clamp-2">{voter.ward_address}</p>
           </div>
           <p className="mt-1 text-xs text-muted-foreground pl-6">Booth: {voter.booth}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/20 border-t">
        <Button 
          onClick={handlePrint} 
          disabled={isPrinting}
          className="w-full gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ backgroundColor: themeColor, borderColor: themeColor }}
        >
          {isPrinting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Slip...
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              Print Voting Slip
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
