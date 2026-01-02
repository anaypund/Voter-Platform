import { useState } from "react";
import { useVoterSearch } from "@/hooks/use-voters";
import { useAppConfig } from "@/hooks/use-config";
import { VoterCard } from "@/components/VoterCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { SearchVotersRequest } from "@shared/schema";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: config } = useAppConfig();
  const [searchParams, setSearchParams] = useState<SearchVotersRequest | null>(null);
  
  // EPIC Form State
  const [epicQuery, setEpicQuery] = useState("");
  
  // Name Form State
  const [nameQuery, setNameQuery] = useState("");
  const [subQuery, setSubQuery] = useState(""); // Husband/Father Name

  const { data: voters, isLoading, error } = useVoterSearch(searchParams);

  const handleEpicSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!epicQuery.trim()) return;
    setSearchParams({ type: "epic", query: epicQuery });
  };

  const handleNameSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameQuery.trim()) return;
    setSearchParams({ type: "name", query: nameQuery, subQuery });
  };

  const themeColor = config?.themeColor || "var(--primary)";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Dynamic Header */}
      <header className="relative overflow-hidden text-primary-foreground shadow-lg z-10">
        <div 
          className="absolute inset-0 z-0 bg-primary" 
          style={{ backgroundColor: themeColor }}
        />
        {config?.headerBannerUrl && (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: `url(${config.headerBannerUrl})` }}
          />
        )}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {config?.logoUrl ? (
              <img 
                src={config.logoUrl} 
                alt="Party Logo" 
                className="w-16 h-16 md:w-20 md:h-20 object-contain bg-white rounded-full p-2 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <span className="text-2xl">🗳️</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-white drop-shadow-md">
                {config?.partyName || "Election Platform"}
              </h1>
              <p className="text-primary-foreground/90 font-medium mt-1">
                Voter Search & Slip Printing Portal
              </p>
            </div>
          </div>
          
          <Link href="/admin">
            <Button variant="secondary" className="shadow-lg backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border-white/20">
              Admin Panel
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Search Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
              <div className="p-6 bg-gradient-to-b from-secondary/50 to-transparent">
                <h2 className="text-xl font-bold mb-4 font-display">Search Voters</h2>
                <Tabs defaultValue="epic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger value="epic" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">EPIC No.</TabsTrigger>
                    <TabsTrigger value="name" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Name Search</TabsTrigger>
                  </TabsList>

                  <TabsContent value="epic">
                    <form onSubmit={handleEpicSearch} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">EPIC Number</label>
                        <Input 
                          placeholder="e.g. ABC1234567" 
                          value={epicQuery}
                          onChange={(e) => setEpicQuery(e.target.value)}
                          className="h-12 rounded-xl border-2 focus-visible:ring-offset-0"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                        style={{ backgroundColor: themeColor }}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search by EPIC
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="name">
                    <form onSubmit={handleNameSearch} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium ml-1">Voter Name</label>
                        <Input 
                          placeholder="Full Name (English/Hindi)" 
                          value={nameQuery}
                          onChange={(e) => setNameQuery(e.target.value)}
                          className="h-12 rounded-xl border-2 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium ml-1 text-muted-foreground">Relative's Name (Optional)</label>
                        <Input 
                          placeholder="Father/Husband Name" 
                          value={subQuery}
                          onChange={(e) => setSubQuery(e.target.value)}
                          className="h-12 rounded-xl border-2 focus-visible:ring-offset-0"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                        style={{ backgroundColor: themeColor }}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Search by Name
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Helper Card */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-5">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> 
                Search Tips
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Enter partial names to find more results</li>
                <li>EPIC number search is most accurate</li>
                <li>You can type in English or Hindi</li>
              </ul>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 bg-card rounded-2xl border border-dashed border-border/60">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Searching voter database...</p>
              </div>
            )}

            {!isLoading && searchParams && voters?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 bg-card rounded-2xl border border-dashed border-border/60 text-center p-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                   <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No voters found</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  We couldn't find any records matching "{searchParams.query}". Try checking the spelling or use a different search method.
                </p>
              </div>
            )}

            {!isLoading && !searchParams && (
              <div className="flex flex-col items-center justify-center h-64 bg-card/50 rounded-2xl border border-dashed border-border/60 text-center p-8">
                 <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">👋</span>
                 </div>
                 <h2 className="text-2xl font-bold font-display text-foreground">Welcome to the Voter Portal</h2>
                 <p className="text-muted-foreground mt-2 max-w-md">
                   Start by searching for a voter using their EPIC number or Name to view details and print voting slips.
                 </p>
              </div>
            )}

            {!isLoading && voters && voters.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">
                    Found {voters.length} Result{voters.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {voters.map((voter) => (
                      <motion.div
                        key={voter._id || voter.epic_no}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <VoterCard voter={voter} themeColor={themeColor} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-foreground">{config?.footerMessage}</p>
          <p className="text-xs text-muted-foreground mt-1">
            © {new Date().getFullYear()} {config?.partyName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
