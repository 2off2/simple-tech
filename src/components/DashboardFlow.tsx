import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UploadDados } from "@/pages/dashboard/UploadDados";
import { SimpleDashboard } from "@/components/SimpleDashboard";

export function DashboardFlow() {
  const [hasUploadedData, setHasUploadedData] = useState(false);

  const handleUploadSuccess = () => {
    setHasUploadedData(true);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-4 cursor-pointer" 
              onClick={handleBackToHome}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/cb98570b-3eaf-4009-9198-43d180016a3c.png" 
                  alt="Simple Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-foreground">Simple</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {!hasUploadedData ? (
          <div className="container mx-auto px-4 py-8">
            <UploadDados onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <SimpleDashboard />
        )}
      </div>
    </div>
  );
}