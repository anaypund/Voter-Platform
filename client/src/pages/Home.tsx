import { useState } from "react";
import { useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useVoterSearch, useGenerateBulkPDF, useShareGeneratedPDF } from "@/hooks/use-voters";
import { useAppConfig } from "@/hooks/use-config";
import { VoterCard } from "@/components/VoterCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, AlertCircle, LogOut, Share2, CheckSquare, Square } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

type SearchVotersRequest = { type: "epic" | "name"; query: string; subQuery?: string };

export default function Home() {
  const { user, logout } = useAuth();
  const { data: config } = useAppConfig();
  const [searchParams, setSearchParams] = useState<SearchVotersRequest | null>(null);
  const [selectedVoterIds, setSelectedVoterIds] = useState<Set<string>>(new Set());
  const [generatedPDF, setGeneratedPDF] = useState<{ blob: Blob; voterCount: number } | null>(null);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  
  // EPIC Form State
  const [epicQuery, setEpicQuery] = useState("");
  
  // Name Form State
  const [nameQuery, setNameQuery] = useState("");
  const [subQuery, setSubQuery] = useState(""); // Husband/Father Name

  const { data: voters, isLoading, error } = useVoterSearch(searchParams);
  const generateBulkPDF = useGenerateBulkPDF();
  const shareGeneratedPDF = useShareGeneratedPDF();
  
  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const handleEpicSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!epicQuery.trim()) return;
    setSearchParams({ type: "epic", query: epicQuery });
    setSelectedVoterIds(new Set()); // Clear selections on new search
    scrollToResults();
  };

  const handleNameSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameQuery.trim()) return;
    setSearchParams({ type: "name", query: nameQuery, subQuery });
    setSelectedVoterIds(new Set()); // Clear selections on new search
    scrollToResults();
  };

  const handleSelectionChange = (voterId: string, selected: boolean) => {
    setSelectedVoterIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(voterId);
      } else {
        newSet.delete(voterId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (voters) {
      setSelectedVoterIds(new Set(voters.map(v => v._id || "")));
    }
  };

  const handleClearAll = () => {
    setSelectedVoterIds(new Set());
    setGeneratedPDF(null); // Clear generated PDF when clearing selections
  };

  const handleGeneratePDF = async () => {
    if (selectedVoterIds.size ===  0) return;
    
    try {
      const result = await generateBulkPDF.mutateAsync({ 
        voterIds: Array.from(selectedVoterIds), 
        lang: "hi" 
      });
      // Store the generated PDF
      setGeneratedPDF(result);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  const handleSharePDF = async () => {
    if (!generatedPDF) return;
    
    try {
      await shareGeneratedPDF.mutateAsync(generatedPDF);
      // Clear selections and PDF after successful share
      setSelectedVoterIds(new Set());
      setGeneratedPDF(null);
    } catch (error) {
      console.error("Share failed:", error);
    }
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
          
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="secondary" className="shadow-lg backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border-white/20">
                Admin Panel
              </Button>
            </Link>
            {user && (
              <Button 
                variant="outline"
                onClick={() => logout()}
                className="text-white-500 border border-white-500 hover:bg-red-500/15 hover:text-red-600 gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 -mt-15 relative z-20">
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
                <li>You can type in English or Marathi</li>
              </ul>
            </div>
          </div>

          {/* Results Area */}
          <div ref={resultsRef} className="lg:col-span-8 scroll-mt-28">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 bg-card rounded-2xl border border-dashed border-border/60">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">Searching voter database...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-64 bg-card rounded-2xl border border-dashed border-border/60 text-center p-8 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-red-700 dark:text-red-300">Search Error</h3>
                <p className="text-red-600 dark:text-red-400 mt-2 max-w-sm">
                  {error instanceof Error ? error.message : "An unexpected error occurred during search"}
                </p>
              </div>
            )}

            {!error && !isLoading && searchParams && voters?.length === 0 && (
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
                    {selectedVoterIds.size > 0 && (
                      <span className="ml-3 text-sm font-normal text-muted-foreground">
                        ({selectedVoterIds.size} selected)
                      </span>
                    )}
                  </h3>
                  
                  {voters.length > 1 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        disabled={selectedVoterIds.size === voters.length}
                        className="gap-1"
                      >
                        <CheckSquare className="w-4 h-4" />
                        Select All
                      </Button>
                      {selectedVoterIds.size > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearAll}
                          className="gap-1"
                        >
                          <Square className="w-4 h-4" />
                          Clear
                        </Button>
                      )}
                    </div>
                  )}
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
                        <VoterCard 
                          voter={voter} 
                          themeColor={themeColor}
                          isSelected={selectedVoterIds.has(voter._id || "")}
                          onSelectionChange={handleSelectionChange}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Floating Action Bar for Bulk Share */}
                <AnimatePresence>
                  {selectedVoterIds.size > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 50 }}
                      transition={{ duration: 0.2 }}
                      className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:bottom-8 md:transform md:-translate-x-1/2 z-50 max-w-full md:max-w-fit"
                    >
                      <div 
                        className="bg-card border-2 rounded-2xl shadow-2xl px-4 py-3 md:px-6 md:py-4 flex flex-wrap items-center gap-3 md:gap-4 justify-center"
                        style={{ borderColor: themeColor }}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: themeColor }}
                          >
                            {selectedVoterIds.size}
                          </div>
                          <span className="font-medium">
                            {selectedVoterIds.size} voter{selectedVoterIds.size !== 1 ? 's' : ''} selected
                          </span>
                        </div>
                        
                        {!generatedPDF ? (
                          <Button
                            onClick={handleGeneratePDF}
                            disabled={generateBulkPDF.isPending}
                            className="gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                            style={{ backgroundColor: themeColor, borderColor: themeColor }}
                          >
                            {generateBulkPDF.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating PDF...
                              </>
                            ) : (
                              <>
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Generate PDF</span>
                                <span className="sm:hidden">Generate</span>
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleSharePDF}
                            disabled={shareGeneratedPDF.isPending}
                            className="gap-2 font-semibold shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700"
                          >
                            {shareGeneratedPDF.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sharing...
                              </>
                            ) : (
                              <>
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Share PDF ({generatedPDF.voterCount})</span>
                                <span className="sm:hidden">Share ({generatedPDF.voterCount})</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
