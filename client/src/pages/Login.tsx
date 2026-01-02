import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppConfig } from "@/hooks/use-config";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function Login() {
  const { data: config } = useAppConfig();
  const themeColor = config?.themeColor || "hsl(var(--primary))";

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {config?.logoUrl ? (
            <img 
              src={config.logoUrl} 
              alt="Logo" 
              className="h-20 w-auto mx-auto mb-4 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🗳️
            </div>
          )}
          <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">
            {config?.partyName || "Election Platform"}
          </h1>
          <p className="text-muted-foreground mt-2">Secure Voter Management System</p>
        </div>

        <Card className="shadow-xl border-border/50 overflow-hidden">
          <div className="h-2 w-full bg-primary" style={{ backgroundColor: themeColor }} />
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Login to access the voter database and admin tools
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button 
              size="lg" 
              className="w-full font-semibold h-12 gap-2 text-base shadow-md transition-all hover:scale-[1.02]"
              onClick={handleLogin}
              style={{ backgroundColor: themeColor }}
            >
              <ShieldCheck className="w-5 h-5" />
              Login with Replit
              <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
            </Button>

            {config?.isPublicAccess && (
              <div className="mt-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <Button variant="link" className="mt-4" onClick={() => window.location.href = "/"}>
                  Continue as Guest (Search Only)
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/30 p-4 text-center text-xs text-muted-foreground">
            Protected area. Authorized personnel only.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
