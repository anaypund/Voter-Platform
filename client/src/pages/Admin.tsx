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
import { Loader2, Save, ArrowLeft, LogOut, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { redirectToLogin } from "@/lib/auth-utils";

export default function Admin() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: config, isLoading: configLoading } = useAppConfig();
  const updateConfig = useUpdateConfig();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const form = useForm<InsertAppConfig>({
    resolver: zodResolver(insertConfigSchema),
    defaultValues: config || {
      partyName: "",
      themeColor: "#ff9933",
      footerMessage: "",
      isPublicAccess: false,
      logoUrl: "",
      headerBannerUrl: "",
      printTemplate: "default",
    }
  });

  // Redirect if not logged in or not admin
  useEffect(() => {
    console.log("Auth status - user:", user, "isLoading:", authLoading, "isAdmin:", user?.isAdmin);
    if (!authLoading && (!user || !user.isAdmin)) {
      console.log("User not authenticated or not admin, redirecting");
      redirectToLogin(toast);
    }
  }, [user, authLoading, toast]);

  // Update form values when config loads
  useEffect(() => {
    if (config) {
      const configWithDefaults = {
        partyName: config.partyName || "",
        themeColor: config.themeColor || "#ff9933",
        footerMessage: config.footerMessage || "",
        isPublicAccess: config.isPublicAccess ?? false,
        logoUrl: config.logoUrl || "",
        headerBannerUrl: config.headerBannerUrl || "",
        printTemplate: config.printTemplate || "default",
      };
      form.reset(configWithDefaults);
      if (config.logoUrl) setLogoPreview(config.logoUrl);
      if (config.headerBannerUrl) setBannerPreview(config.headerBannerUrl);
    }
  }, [config, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, field: "logo" | "banner"): Promise<string | null> => {
    const formData = new FormData();
    formData.append(field, file);

    try {
      const response = await fetch(`/api/upload/${field}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error(`Failed to upload ${field}:`, error);
      return null;
    }
  };

  const onSubmit = async (data: InsertAppConfig) => {
    try {
      setUploading(true);
      console.log("Form submitted with data:", data);
      let updatedData = { ...data };

      // Upload logo if a new file was selected
      if (logoFile) {
        console.log("Uploading logo...", logoFile);
        const logoUrl = await uploadFile(logoFile, "logo");
        console.log("Logo upload result:", logoUrl);
        if (logoUrl) {
          updatedData.logoUrl = logoUrl;
        } else {
          toast({
            title: "Warning",
            description: "Logo upload failed, using previous URL",
            variant: "destructive",
          });
        }
      }

      // Upload banner if a new file was selected
      if (bannerFile) {
        console.log("Uploading banner...", bannerFile);
        const bannerUrl = await uploadFile(bannerFile, "banner");
        console.log("Banner upload result:", bannerUrl);
        if (bannerUrl) {
          updatedData.headerBannerUrl = bannerUrl;
        } else {
          toast({
            title: "Warning",
            description: "Banner upload failed, using previous URL",
            variant: "destructive",
          });
        }
      }

      console.log("Updating config with data:", updatedData);
      await updateConfig.mutateAsync(updatedData);
      setLogoFile(null);
      setBannerFile(null);
      
      toast({
        title: "Configuration Saved",
        description: "Your changes have been applied successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save configuration.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.isAdmin) return null; // Redirect handled in useEffect

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

        <form onSubmit={form.handleSubmit(
          onSubmit, 
          (errors) => {
            console.error("Form validation errors:", errors);
            Object.entries(errors).forEach(([key, error]: [string, any]) => {
              console.error(`${key}: ${error?.message}`);
            });
          }
        )} className="space-y-6">
          
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
              <CardDescription>Upload logo and banner images directly from your device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex gap-2">
                  <Input 
                    id="logo" 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                  {logoPreview && (
                    <div className="p-2 bg-muted/30 rounded border inline-block">
                      <img src={logoPreview} alt="Logo Preview" className="h-10 object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Upload */}
              <div className="space-y-2">
                <Label htmlFor="banner">Header Banner</Label>
                <div className="flex gap-2 flex-col">
                  <Input 
                    id="banner" 
                    type="file" 
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="cursor-pointer"
                  />
                  {bannerPreview && (
                    <div className="p-2 bg-muted/30 rounded border inline-block w-full">
                      <img src={bannerPreview} alt="Banner Preview" className="h-20 w-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
             <Button 
               type="submit" 
               size="lg" 
               disabled={updateConfig.isPending || uploading}
               className="min-w-[150px] shadow-lg shadow-primary/20"
               style={{ backgroundColor: form.watch("themeColor") || undefined }}
             >
               {updateConfig.isPending || uploading ? (
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
