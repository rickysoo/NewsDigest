import { useQuery } from "@tanstack/react-query";
import StatusCards from "@/components/dashboard/status-cards";
import RecentDigests from "@/components/dashboard/recent-digests";
import ActivityLogs from "@/components/dashboard/activity-logs";
import ScheduleConfig from "@/components/dashboard/schedule-config";
import { Button } from "@/components/ui/button";
import { Bell, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { type DigestStats } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: stats, refetch: refetchStats } = useQuery<DigestStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const handleManualTrigger = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/digest/trigger");
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Digest generated and sent successfully",
        });
        refetchStats();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate digest",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-sm text-slate-600 mt-1">
              Monitor your FMT news digest automation
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Manual Trigger Button */}
            <Button 
              onClick={handleManualTrigger}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Now"}
            </Button>
            {/* Settings */}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="p-6">
        <StatusCards stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RecentDigests />
          <ActivityLogs />
        </div>

        <ScheduleConfig />
      </main>
    </>
  );
}
