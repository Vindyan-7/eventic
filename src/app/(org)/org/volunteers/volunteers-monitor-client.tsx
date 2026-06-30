"use client";

import React, { useState } from "react";
import {
  Users,
  Activity,
  User,
  Key,
  Clock,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Search
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Volunteer {
  id: string;
  name: string;
  email?: string;
  status: string;
  lastActive: string | null;
  type: string;
}

interface ActivityLog {
  id: string;
  volunteerName: string;
  actionType: string;
  eventTitle: string;
  createdAt: string;
  details: any;
}

interface VolunteersMonitorClientProps {
  workspaceName: string;
  registeredVolunteers: Volunteer[];
  temporaryVolunteers: Volunteer[];
  activityLogs: ActivityLog[];
}

export function VolunteersMonitorClient({
  workspaceName,
  registeredVolunteers,
  temporaryVolunteers,
  activityLogs,
}: VolunteersMonitorClientProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "logs">("directory");
  const [searchQuery, setSearchQuery] = useState("");

  const allVolunteers = [...registeredVolunteers, ...temporaryVolunteers];

  const filteredVolunteers = allVolunteers.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.email && v.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getActionTypeBadge = (action: string) => {
    switch (action) {
      case "LOGIN":
        return <Badge variant="outline" className="bg-emerald-950/40 text-emerald-450 border-emerald-900/40">Login</Badge>;
      case "LOGOUT":
        return <Badge variant="outline" className="bg-neutral-800 text-neutral-400 border-neutral-700">Logout</Badge>;
      case "QR_CHECKIN":
        return <Badge variant="outline" className="bg-blue-950/40 text-blue-450 border-blue-900/40">QR Scan</Badge>;
      case "MANUAL_CHECKIN":
        return <Badge variant="outline" className="bg-indigo-950/40 text-indigo-455 border-indigo-900/40">Manual Check-In</Badge>;
      case "OFFLINE_START":
        return <Badge variant="outline" className="bg-amber-950/40 text-amber-450 border-amber-900/40">Offline Start</Badge>;
      case "OFFLINE_END":
        return <Badge variant="outline" className="bg-emerald-950/40 text-emerald-450 border-emerald-900/40">Offline End</Badge>;
      case "QUEUE_SYNC":
        return <Badge variant="outline" className="bg-purple-950/40 text-purple-450 border-purple-900/40">Queue Sync</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans text-xs">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Volunteers Monitor</h1>
          <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase tracking-wider">
            {workspaceName} • Live Activity & System Synchronization
          </p>
        </div>

        <div className="flex bg-neutral-950 border border-neutral-900 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === "directory" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-white"
            }`}
          >
            Directory ({allVolunteers.length})
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === "logs" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-white"
            }`}
          >
            Live Activity Logs
          </button>
        </div>
      </div>

      {/* KPI Stats overview row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-neutral-900 bg-neutral-950/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Registered Scanners</span>
              <Users className="h-4 w-4 text-neutral-400" />
            </div>
            <span className="text-3xl font-extrabold text-white mt-2 block">{registeredVolunteers.length}</span>
          </CardContent>
        </Card>

        <Card className="border-neutral-900 bg-neutral-950/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Active Access Codes</span>
              <Key className="h-4 w-4 text-neutral-400" />
            </div>
            <span className="text-3xl font-extrabold text-white mt-2 block">{temporaryVolunteers.length}</span>
          </CardContent>
        </Card>

        <Card className="border-neutral-900 bg-neutral-950/40">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Synchronization Events</span>
              <Activity className="h-4 w-4 text-neutral-400" />
            </div>
            <span className="text-3xl font-extrabold text-white mt-2 block">
              {activityLogs.filter(l => l.actionType === "QUEUE_SYNC").length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main content directory list */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <div className="flex max-w-md border border-neutral-900 rounded-xl overflow-hidden bg-neutral-950">
            <div className="flex items-center justify-center pl-3">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter volunteers by name..."
              className="flex-1 bg-transparent border-0 outline-none text-white h-10 px-3 text-xs"
            />
          </div>

          <div className="border border-neutral-900 rounded-3xl overflow-hidden bg-neutral-950/20 divide-y divide-neutral-900">
            {filteredVolunteers.length > 0 ? (
              filteredVolunteers.map((vol) => (
                <div key={vol.id} className="p-4 flex justify-between items-center hover:bg-neutral-900/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center">
                      {vol.type === "Registered" ? <User className="h-4 w-4 text-white" /> : <Key className="h-4 w-4 text-neutral-400" />}
                    </div>
                    <div>
                      <span className="font-extrabold text-white block">{vol.name}</span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">{vol.email || "No email"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className="bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {vol.type}
                    </Badge>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {vol.lastActive ? `Added/Active: ${new Date(vol.lastActive).toLocaleDateString()}` : "Never active"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500">No active volunteers found matching criteria.</div>
            )}
          </div>
        </div>
      )}

      {/* Main content Live Activity Logs */}
      {activeTab === "logs" && (
        <div className="border border-neutral-900 rounded-3xl overflow-hidden bg-neutral-950/20 divide-y divide-neutral-900">
          {activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <div key={log.id} className="p-4 flex justify-between items-start gap-4 hover:bg-neutral-900/10 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">{log.volunteerName}</span>
                    {getActionTypeBadge(log.actionType)}
                  </div>
                  
                  <p className="text-[10px] text-neutral-400">
                    {log.actionType === "QR_CHECKIN" || log.actionType === "MANUAL_CHECKIN" ? (
                      <>Checked in attendee <span className="font-bold text-white">{log.details?.attendeeName}</span> (Ticket: {log.details?.ticketNumber})</>
                    ) : log.actionType === "QUEUE_SYNC" ? (
                      <>Uploaded <span className="font-bold text-white">{log.details?.count}</span> pending ticket entries to server</>
                    ) : (
                      <>Performed action in event: {log.eventTitle}</>
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 font-mono block">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="text-[9px] text-neutral-600 block mt-0.5">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-neutral-500">No live activity logs recorded.</div>
          )}
        </div>
      )}

    </div>
  );
}
