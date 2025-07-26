import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type SystemLog } from "@shared/schema";

const getLogColor = (type: string) => {
  switch (type) {
    case "error":
      return "bg-red-500";
    case "warning":
      return "bg-amber-500";
    case "info":
      return "bg-blue-500";
    default:
      return "bg-green-500";
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

export default function ActivityLogs() {
  const { data: logs, isLoading } = useQuery<SystemLog[]>({
    queryKey: ["/api/logs"],
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">System Activity</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-slate-200 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">System Activity</h3>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full"
            >
              All
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Errors
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {logs && logs.length > 0 ? (
            logs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-start space-x-3">
                <div 
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getLogColor(log.type)}`} 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">{log.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatTimeAgo(new Date(log.createdAt))}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              </div>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No activity yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                System activity will appear here.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
