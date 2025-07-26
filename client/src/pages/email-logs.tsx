import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, X, Clock } from "lucide-react";
import { type EmailLog } from "@shared/schema";

export default function EmailLogs() {
  const { data: logs, isLoading } = useQuery<EmailLog[]>({
    queryKey: ["/api/email-logs"],
  });

  if (isLoading) {
    return (
      <div>
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-slate-900">Email Logs</h2>
          <p className="text-sm text-slate-600 mt-1">
            Track email delivery status and history
          </p>
        </header>
        <main className="p-6">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3" />;
      case "failed":
        return <X className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-slate-900">Email Logs</h2>
        <p className="text-sm text-slate-600 mt-1">
          Track email delivery status and history
        </p>
      </header>

      <main className="p-6">
        {logs && logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id} className="bg-white shadow-sm border border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {log.subject}
                        </p>
                        <p className="text-xs text-slate-500">
                          To: {log.recipient} • {" "}
                          {log.sentAt 
                            ? new Date(log.sentAt).toLocaleString()
                            : new Date(log.createdAt).toLocaleString()
                          }
                        </p>
                        {log.error && (
                          <p className="text-xs text-red-600 mt-1">
                            Error: {log.error}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(log.status)}>
                      {getStatusIcon(log.status)}
                      <span className="ml-1">
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardContent className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No email logs yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Email delivery logs will appear here once digests are sent.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
