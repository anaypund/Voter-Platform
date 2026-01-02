import { useAuth } from "@/hooks/use-auth";
import { useAppConfig, useUpdateConfig } from "@/hooks/use-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConfigSchema, type InsertAppConfig } from "@shared/schema";
import { Loader2, Save, ArrowLeft, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { redirectToLogin } from "@/lib/auth-utils";

export default function Admin() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: config, isLoading: configLoading } = useAppConfig();
  const updateConfig = useUpdateConfig();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<InsertAppConfig>({
    resolver: zodResolver(insertConfigSchema),
    defaultValues: config || {
      partyName: "",
      themeColor: "#ff9933",
      footerMessage: "",
      isPublicAccess: false,
      logoUrl: "",
      headerBannerUrl: "",
    }
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      redirectToLogin(toast);
    }
  }, [user, authLoading, toast]);

  // Update form values when config loads
  useEffect(() => {
    if (config) {
      form.reset(config);
    }
  }, [config, form]);

  const onSubmit = async (data: InsertAppConfig) => {
    try {
      await updateConfig.mutateAsync(data);
      toast({
        title: "Configuration Saved",
        description: "Your changes have been applied successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null; // Redirect handled in useEffect

  return (
    <div className="min-h-screen bg-muted/20 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground">Manage platform settings and configuration</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 gap-2"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* General Settings */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure the main identity of the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="partyName">Party / Organization Name</Label>
                  <Input id="partyName" {...form.register("partyName")} placeholder="My Party" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="themeColor">Theme Color (Hex)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="themeColor" 
                      type="color" 
                      className="w-12 h-10 p-1 cursor-pointer" 
                      {...form.register("themeColor")} 
                    />
                    <Input 
                      {...form.register("themeColor")} 
                      placeholder="#ff9933" 
                      className="font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerMessage">Footer Message</Label>
                <Input id="footerMessage" {...form.register("footerMessage")} placeholder="Vote for Progress!" />
              </div>

              <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label className="text-base">Public Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to search without logging in
                  </p>
                </div>
                <Switch 
                  checked={form.watch("isPublicAccess") ?? false}
                  onCheckedChange={(checked) => form.setValue("isPublicAccess", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card className="shadow-sm border-border/60">
            <CardHeader>
              <CardTitle>Branding & Images</CardTitle>
              <CardDescription>Set URLs for logos and banners. Use external image hosting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" {...form.register("logoUrl")} placeholder="https://example.com/logo.png" />
                {form.watch("logoUrl") && (
                  <div className="mt-2 p-2 bg-muted/30 rounded border inline-block">
                    <img src={form.watch("logoUrl") || ""} alt="Logo Preview" className="h-10 object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="headerBannerUrl">Header Banner URL</Label>
                <Input id="headerBannerUrl" {...form.register("headerBannerUrl")} placeholder="https://example.com/banner.jpg" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
             <Button 
               type="submit" 
               size="lg" 
               disabled={updateConfig.isPending}
               className="min-w-[150px] shadow-lg shadow-primary/20"
               style={{ backgroundColor: form.watch("themeColor") || undefined }}
             >
               {updateConfig.isPending ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
                   Saving...
                 </>
               ) : (
                 <>
                   <Save className="w-4 h-4 mr-2" />
                   Save Changes
                 </>
               )}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
