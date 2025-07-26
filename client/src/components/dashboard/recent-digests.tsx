import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Check } from "lucide-react";
import { type Digest } from "@shared/schema";
import { Link } from "wouter";

export default function RecentDigests() {
  const { data: digests, isLoading } = useQuery<Digest[]>({
    queryKey: ["/api/digests"],
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent Digests</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
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
          <h3 className="text-lg font-semibold text-slate-900">Recent Digests</h3>
          <Link href="/digests">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {digests && digests.length > 0 ? (
            digests.slice(0, 3).map((digest) => (
              <div key={digest.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Newspaper className="text-blue-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900 truncate">
                    {digest.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(digest.createdAt).toLocaleDateString()} at{" "}
                    {new Date(digest.createdAt).toLocaleTimeString()} • {digest.wordCount} words
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <Badge 
                      variant={digest.status === "sent" ? "default" : "secondary"}
                      className={digest.status === "sent" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {digest.status === "sent" && <Check className="w-3 h-3 mr-1" />}
                      {digest.status.charAt(0).toUpperCase() + digest.status.slice(1)}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Newspaper className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No digests yet</h3>
              <p className="mt-1 text-sm text-slate-500">
                Digests will appear here once generated.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
