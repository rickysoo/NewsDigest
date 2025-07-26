import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Clock, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ScheduleSettings {
  enabled: boolean;
  interval: number;
  recipients: string[];
  isActive: boolean;
}

export default function ScheduleConfig() {
  const { toast } = useToast();
  
  const { data: schedule, isLoading } = useQuery<ScheduleSettings>({
    queryKey: ["/api/schedule"],
  });

  const { data: recipients } = useQuery<string[]>({
    queryKey: ["/api/recipients"],
  });

  const handleToggleSchedule = async () => {
    try {
      const response = await apiRequest("POST", "/api/schedule/toggle");
      const result = await response.json();
      
      toast({
        title: "Success",
        description: result.message,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle schedule",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Schedule Configuration</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Schedule Configuration</h3>
        <p className="text-sm text-slate-600 mt-1">
          Manage your digest automation settings
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Schedule Status */}
          <div className={`border rounded-lg p-4 ${
            schedule?.enabled 
              ? "bg-green-50 border-green-200" 
              : "bg-slate-50 border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-medium ${
                  schedule?.enabled ? "text-green-900" : "text-slate-900"
                }`}>
                  Schedule Status
                </h4>
                <p className={`text-lg font-semibold mt-1 ${
                  schedule?.enabled ? "text-green-700" : "text-slate-700"
                }`}>
                  {schedule?.enabled ? "Active" : "Inactive"}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                schedule?.enabled ? "bg-green-100" : "bg-slate-100"
              }`}>
                {schedule?.enabled ? (
                  <Play className={schedule?.enabled ? "text-green-600" : "text-slate-600"} />
                ) : (
                  <Pause className="text-slate-600" />
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleToggleSchedule}
              className={`mt-3 text-sm font-medium ${
                schedule?.enabled 
                  ? "text-green-700 hover:text-green-800" 
                  : "text-slate-700 hover:text-slate-800"
              }`}
            >
              {schedule?.enabled ? "Pause Schedule" : "Start Schedule"}
            </Button>
          </div>

          {/* Interval Settings */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-900">Interval</h4>
                <p className="text-lg font-semibold text-blue-700 mt-1">
                  {schedule?.interval || 3} Hours
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="text-blue-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="mt-3 text-sm text-blue-700 hover:text-blue-800 font-medium"
            >
              Configure
            </Button>
          </div>

          {/* Email Recipients */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-purple-900">Recipients</h4>
                <p className="text-lg font-semibold text-purple-700 mt-1">
                  {recipients?.length || 0} Active
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600" />
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="mt-3 text-sm text-purple-700 hover:text-purple-800 font-medium"
            >
              Manage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
