import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, Plus, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ScheduleSettings {
  enabled: boolean;
  interval: number;
  recipients: string[];
  isActive: boolean;
}

export default function Schedule() {
  const { toast } = useToast();
  const [newRecipient, setNewRecipient] = useState("");
  const [intervalInput, setIntervalInput] = useState("");

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

  const handleUpdateInterval = async () => {
    if (!intervalInput || isNaN(Number(intervalInput))) {
      toast({
        title: "Error",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    const interval = parseInt(intervalInput);
    if (interval < 1 || interval > 24) {
      toast({
        title: "Error",
        description: "Interval must be between 1 and 24 hours",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/schedule/interval", { interval });
      const result = await response.json();
      
      toast({
        title: "Success",
        description: result.message,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      setIntervalInput("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interval",
        variant: "destructive",
      });
    }
  };

  const handleAddRecipient = async () => {
    if (!newRecipient) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    const currentRecipients = recipients || [];
    if (currentRecipients.includes(newRecipient)) {
      toast({
        title: "Error",
        description: "Email address already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedRecipients = [...currentRecipients, newRecipient];
      const response = await apiRequest("POST", "/api/recipients", { 
        recipients: updatedRecipients 
      });
      
      toast({
        title: "Success",
        description: "Recipient added successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      setNewRecipient("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add recipient",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRecipient = async (emailToRemove: string) => {
    const currentRecipients = recipients || [];
    const updatedRecipients = currentRecipients.filter(email => email !== emailToRemove);

    try {
      const response = await apiRequest("POST", "/api/recipients", { 
        recipients: updatedRecipients 
      });
      
      toast({
        title: "Success",
        description: "Recipient removed successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove recipient",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-slate-900">Schedule</h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure digest automation and email settings
          </p>
        </header>
        <main className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-200 rounded-lg"></div>
            <div className="h-48 bg-slate-200 rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-slate-900">Schedule</h2>
        <p className="text-sm text-slate-600 mt-1">
          Configure digest automation and email settings
        </p>
      </header>

      <main className="p-6 space-y-6">
        {/* Schedule Status */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Schedule Status</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge 
                  variant={schedule?.enabled ? "default" : "secondary"}
                  className={schedule?.enabled ? "bg-green-100 text-green-800" : ""}
                >
                  {schedule?.enabled ? (
                    <><Play className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    <><Pause className="w-3 h-3 mr-1" /> Inactive</>
                  )}
                </Badge>
                <span className="text-sm text-slate-600">
                  Digest every {schedule?.interval || 3} hours
                </span>
              </div>
              <Button onClick={handleToggleSchedule}>
                {schedule?.enabled ? "Pause Schedule" : "Start Schedule"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interval Configuration */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Interval Settings</h3>
            <p className="text-sm text-slate-600">
              Configure how often digests are generated (1-24 hours)
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <Label htmlFor="interval">Hours between digests</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max="24"
                  placeholder={schedule?.interval?.toString() || "3"}
                  value={intervalInput}
                  onChange={(e) => setIntervalInput(e.target.value)}
                />
              </div>
              <Button onClick={handleUpdateInterval}>
                Update Interval
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Recipients */}
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Email Recipients</h3>
            <p className="text-sm text-slate-600">
              Manage who receives the digest emails
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new recipient */}
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRecipient()}
              />
              <Button onClick={handleAddRecipient}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Recipients list */}
            {recipients && recipients.length > 0 ? (
              <div className="space-y-2">
                {recipients.map((email) => (
                  <div 
                    key={email} 
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <span className="text-sm text-slate-900">{email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(email)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <p>No recipients configured</p>
                <p className="text-sm">Add email addresses to receive digests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
