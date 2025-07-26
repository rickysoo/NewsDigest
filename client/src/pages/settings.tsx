import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Database, Mail, Globe } from "lucide-react";
import { type Setting } from "@shared/schema";

export default function Settings() {
  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  if (isLoading) {
    return (
      <div>
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure application settings and preferences
          </p>
        </header>
        <main className="p-6">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const getSettingValue = (key: string) => {
    const setting = settings?.find(s => s.key === key);
    return setting?.value || "";
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-600 mt-1">
          Configure application settings and preferences
        </p>
      </header>

      <main className="p-6 space-y-6">
        {/* Email Configuration */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Email Configuration</h3>
            </div>
            <p className="text-sm text-slate-600">
              Configure SMTP settings for email delivery
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.gmail.com" />
              </div>
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" placeholder="587" />
              </div>
              <div>
                <Label htmlFor="smtp-user">Email Address</Label>
                <Input id="smtp-user" type="email" placeholder="your-email@gmail.com" />
              </div>
              <div>
                <Label htmlFor="smtp-pass">App Password</Label>
                <Input id="smtp-pass" type="password" placeholder="••••••••••••••••" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button>Save Changes</Button>
              <Button variant="outline">Test Connection</Button>
            </div>
          </CardContent>
        </Card>

        {/* OpenAI Configuration */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">AI Configuration</h3>
            </div>
            <p className="text-sm text-slate-600">
              Configure OpenAI API settings for digest generation
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input id="openai-key" type="password" placeholder="sk-••••••••••••••••••••••••••••••••••••••••••••••••" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openai-model">Model</Label>
                <Input id="openai-model" value="gpt-4o" readOnly />
              </div>
              <div>
                <Label htmlFor="word-count">Target Word Count</Label>
                <Input id="word-count" placeholder="500" />
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">System Information</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Application Version</Label>
                <p className="text-sm text-slate-600">1.0.0</p>
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Badge variant="outline">Production</Badge>
              </div>
              <div className="space-y-2">
                <Label>Schedule Status</Label>
                <Badge className="bg-green-100 text-green-800">
                  {getSettingValue("schedule_enabled") === "true" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Last Digest</Label>
                <p className="text-sm text-slate-600">
                  {getSettingValue("last_digest_time") 
                    ? new Date(getSettingValue("last_digest_time")).toLocaleString()
                    : "Never"
                  }
                </p>
              </div>
            </div>

            {/* Current Settings */}
            {settings && settings.length > 0 && (
              <div className="mt-6">
                <Label className="text-base">Current Settings</Label>
                <div className="mt-2 space-y-2">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm font-medium">{setting.key}</span>
                      <span className="text-sm text-slate-600 truncate max-w-xs">
                        {setting.key === "email_recipients" 
                          ? `${JSON.parse(setting.value).length} recipients`
                          : setting.value
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
