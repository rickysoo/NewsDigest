import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Check, X, Clock } from "lucide-react";
import { type Digest } from "@shared/schema";

export default function Digests() {
  const { data: digests, isLoading } = useQuery<Digest[]>({
    queryKey: ["/api/digests"],
  });

  if (isLoading) {
    return (
      <div>
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-slate-900">Digests</h2>
          <p className="text-sm text-slate-600 mt-1">
            View all generated news digests
          </p>
        </header>
        <main className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
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
        <h2 className="text-2xl font-bold text-slate-900">Digests</h2>
        <p className="text-sm text-slate-600 mt-1">
          View all generated news digests
        </p>
      </header>

      <main className="p-6">
        {digests && digests.length > 0 ? (
          <div className="space-y-4">
            {digests.map((digest) => (
              <Card key={digest.id} className="bg-white shadow-sm border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Newspaper className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-slate-900">
                          {digest.title}
                        </h3>
                        <Badge className={getStatusColor(digest.status)}>
                          {getStatusIcon(digest.status)}
                          <span className="ml-1">
                            {digest.status.charAt(0).toUpperCase() + digest.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-4">
                        {new Date(digest.createdAt).toLocaleDateString()} at{" "}
                        {new Date(digest.createdAt).toLocaleTimeString()} • {digest.wordCount} words
                      </p>
                      
                      <p className="text-slate-700 line-clamp-3">
                        {digest.content.substring(0, 300)}...
                      </p>
                    </div>
                    
                    <div className="ml-4">
                      <Button variant="outline" size="sm">
                        View Full
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardContent className="text-center py-12">
              <Newspaper className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No digests yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Digests will appear here once generated automatically or manually.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
