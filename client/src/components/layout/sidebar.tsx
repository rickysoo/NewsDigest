import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Newspaper, 
  Gauge, 
  FileText, 
  Mail, 
  Clock, 
  Settings 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Gauge },
  { name: "Digests", href: "/digests", icon: FileText },
  { name: "Email Logs", href: "/email-logs", icon: Mail },
  { name: "Schedule", href: "/schedule", icon: Clock },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-sm border-r border-slate-200">
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="flex items-center px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Newspaper className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">FMT Digest</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Status Footer */}
        <div className="px-4 py-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500">System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
