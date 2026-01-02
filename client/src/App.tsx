import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useAppConfig } from "@/hooks/use-config";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";

function Router() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: config, isLoading: configLoading } = useAppConfig();
  const [location, setLocation] = useLocation();

  if (authLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Auth Guard Logic
  const isPublic = config?.isPublicAccess;
  const isAuthenticated = !!user;

  // If trying to access admin without auth, redirect to login
  if (location.startsWith("/admin") && !isAuthenticated) {
    setLocation("/login");
    return null;
  }
  
  // If platform is private and user not logged in, show Login unless explicitly on login page
  if (!isPublic && !isAuthenticated && location !== "/login") {
     return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
