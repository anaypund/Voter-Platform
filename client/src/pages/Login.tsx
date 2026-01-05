import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppConfig } from "@/hooks/use-config";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const { data: config } = useAppConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const themeColor = config?.themeColor || "hsl(var(--primary))";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Authentication failed");
        return;
      }

      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-2xl">
              {isSignup ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignup 
                ? "Sign up to access the voter database" 
                : "Login to access the voter database and admin tools"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button 
                type="submit"
                size="lg" 
                className="w-full font-semibold h-12 gap-2 text-base shadow-md transition-all hover:scale-[1.02]"
                disabled={isLoading}
                style={{ backgroundColor: themeColor }}
              >
                {isLoading ? (
                  <>Loading...</>
                ) : isSignup ? (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Sign Up
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignup(false);
                      setError("");
                      setUsername("");
                      setPassword("");
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignup(true);
                      setError("");
                      setUsername("");
                      setPassword("");
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 p-4 text-center text-xs text-muted-foreground">
            Protected area. Authorized personnel only.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
