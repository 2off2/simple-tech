import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardContent } from "@/components/DashboardContent";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function SimpleDashboard() {
  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Header global com botão voltar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">Simple</span>
            </div>
            
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <AppSidebar />
        
        {/* Main content com padding-top para compensar header fixo */}
        <main className="flex-1 pt-16">
          <DashboardContent />
        </main>
      </div>
    </SidebarProvider>
  );
}