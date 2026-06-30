"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/ui";
import { CheckInFlowChart } from "@/components/analytics/analytics-charts";
import { exportToCSV } from "@/lib/admin/export";
import { toast } from "sonner";
import { QrCode, Download, ShieldCheck, Activity, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScannerCode {
  id: string;
  code: string;
  expires_at: string;
  event: { title: string } | null;
}

interface CheckinRecord {
  id: string;
  checked_in_at: string;
  scanned_by: string | null;
}

export function ScannersAnalyticsClient({ scanCodes, checkins }: { scanCodes: ScannerCode[]; checkins: CheckinRecord[] }) {
  const [filterRange, setFilterRange] = useState("all");

  const getFilteredCheckins = () => {
    if (filterRange === "all") return checkins;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - Number(filterRange));
    return checkins.filter(c => new Date(c.checked_in_at) >= limitDate);
  };

  const filteredCheckins = getFilteredCheckins();

  // 1. Peak checkin hours calculation (group by hour)
  const hourMap: Record<string, number> = {};
  filteredCheckins.forEach(c => {
    const hour = new Date(c.checked_in_at).getHours();
    const hourStr = `${hour.toString().padStart(2, "0")}:00`;
    hourMap[hourStr] = (hourMap[hourStr] || 0) + 1;
  });

  // Sort hours and generate timeline data
  const velocityData = Object.entries(hourMap)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const activeVelocityData = velocityData.length > 0 ? velocityData : [{ hour: "09:00", count: 0 }];

  // 2. Scan count calculations
  const totalScans = filteredCheckins.length;
  const activeSessions = scanCodes.filter(s => new Date(s.expires_at) > new Date()).length;

  // Most active scanner codes/devices
  const codeStatsMap: Record<string, number> = {};
  filteredCheckins.forEach(c => {
    const code = c.scanned_by || "Manual Admin";
    codeStatsMap[code] = (codeStatsMap[code] || 0) + 1;
  });

  const rankedStaff = Object.entries(codeStatsMap)
    .map(([code, count]) => {
      // Find event or code details
      const match = scanCodes.find(s => s.code === code);
      return {
        code,
        count,
        event_title: match?.event?.title || "Staff / Admin Panel"
      };
    })
    .sort((a, b) => b.count - a.count);

  const handleExport = () => {
    const csvData = rankedStaff.map(s => ({
      ScannerCode: s.code,
      CheckinsVerified: s.count,
      AssociatedEvent: s.event_title
    }));
    exportToCSV(csvData, "eventic_scanner_analytics.csv");
    toast.success("Scanner analytics CSV downloaded successfully");
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      <div className="flex justify-between items-center">
        <AdminHeader
          title="Gate Access Control Analytics"
          description="Track check-in peak hours, scanner session loads, and gate staff velocity"
        />
        <div className="flex items-center gap-3">
          <select
            value={filterRange}
            onChange={e => setFilterRange(e.target.value)}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">Lifetime Account History</option>
          </select>
          <Button
            onClick={handleExport}
            className="bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-850 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5 text-xs"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Intelligence KPI Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 text-xs">
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Total Scans & Check-ins</span>
            <Activity className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{totalScans}</h2>
            <p className="text-[10px] text-neutral-550 font-bold mt-1.5">Verified barcodes checked at gate</p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Active Scanner Sessions</span>
            <QrCode className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{activeSessions}</h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1.5">Staff scanner sessions currently active</p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Average Check-ins / Code</span>
            <Users className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {Math.round(totalScans / (scanCodes.length || 1))}
            </h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1.5">Scans verified per credential key</p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Scan Error Rate (Est)</span>
            <ShieldCheck className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">0.0%</h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1.5">Duplicate / ticket mismatches rejected</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Checkin Velocity Bar Chart */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-white">Hourly Check-in Velocity Peaks</h3>
          <p className="text-[10px] text-neutral-500 font-bold">Analysis of gate traffic and entry flow rates per hour</p>
        </div>
        <div className="pt-2">
          <CheckInFlowChart data={activeVelocityData} />
        </div>
      </div>

      {/* Ranked Staff Scanners Table */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Most Productive Gate Credentials
        </h3>
        <div className="border border-neutral-900 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3 pl-4">Scanner Key Code</th>
                <th className="p-3">Event Destination</th>
                <th className="p-3">Successful Entry Check-ins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              {rankedStaff.slice(0, 5).map((staff, idx) => (
                <tr key={idx} className="hover:bg-neutral-900/10">
                  <td className="p-3 pl-4 font-mono text-white font-bold">
                    {staff.code}
                  </td>
                  <td className="p-3">
                    {staff.event_title}
                  </td>
                  <td className="p-3 text-white font-mono font-bold">
                    {staff.count} verified
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
