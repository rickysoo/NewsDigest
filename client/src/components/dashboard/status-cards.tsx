import { Clock, FileText, CheckCircle, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type DigestStats } from "@shared/schema";

interface StatusCardsProps {
  stats?: DigestStats;
}

export default function StatusCards({ stats }: StatusCardsProps) {
  const cards = [
    {
      title: "Next Digest",
      value: stats?.nextDigestTime || "Loading...",
      subtitle: "in 47 minutes",
      icon: Clock,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Digests",
      value: stats?.totalDigests?.toLocaleString() || "0",
      subtitle: "+12 this week",
      subtitleColor: "text-green-600",
      icon: FileText,
      iconBg: "bg-green-100", 
      iconColor: "text-green-600",
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      subtitle: "Last 30 days",
      subtitleColor: "text-green-600",
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "System Status",
      value: stats?.systemStatus || "Loading...",
      subtitle: "All services running",
      icon: Activity,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="bg-white shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.valueColor || "text-slate-900"}`}>
                    {card.value}
                  </p>
                  <p className={`text-xs mt-1 ${card.subtitleColor || "text-slate-500"}`}>
                    {card.subtitle}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`text-xl ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
