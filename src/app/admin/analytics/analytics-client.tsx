"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/ui";
import { RegistrationTrendChart, CategoryDoughnutChart } from "@/components/analytics/analytics-charts";
import { exportToCSV } from "@/lib/admin/export";
import { toast } from "sonner";
import { BarChart3, Download, TrendingUp, Calendar, Target, Award, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventAnalyticsRecord {
  id: string;
  title: string;
  category: string;
  status: string;
  venue: string;
  starts_at: string;
  is_featured: boolean;
  organization_name: string;
  registrations: any[];
}

export function AnalyticsClient({ events }: { events: EventAnalyticsRecord[] }) {
  const [filterRange, setFilterRange] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const getFilteredEvents = () => {
    let result = events;

    // Filter by date range
    if (filterRange !== "all") {
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - Number(filterRange));
      result = result.filter(e => new Date(e.starts_at) >= limitDate);
    }

    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter(e => e.category === categoryFilter);
    }

    return result;
  };

  const filteredEvents = getFilteredEvents();

  // 1. Calculations - Total admissions, checkins, and attendance rate
  let totalAdmissions = 0;
  let totalCheckins = 0;

  filteredEvents.forEach(e => {
    totalAdmissions += e.registrations?.length || 0;
    totalCheckins += e.registrations?.filter((r: any) => r.checked_in_at).length || 0;
  });

  const attendanceRate = totalAdmissions > 0 ? Math.round((totalCheckins / totalAdmissions) * 100) : 0;

  // 2. Calculations - Registrations Trend Timeline (grouped by signup date)
  const timelineMap: Record<string, number> = {};
  filteredEvents.forEach(e => {
    e.registrations?.forEach((r: any) => {
      const dateStr = new Date(r.created_at).toISOString().split("T")[0];
      timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
    });
  });

  const trendTimeline = Object.entries(timelineMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const activeTrendData = trendTimeline.length > 0 ? trendTimeline : [{ date: new Date().toISOString().split("T")[0], count: 0 }];

  // 3. Calculations - Category distribution
  const catMap: Record<string, number> = {};
  filteredEvents.forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + e.registrations?.length || 0;
  });

  const catData = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .filter(c => c.count > 0);

  // Extract unique categories for filter
  const uniqueCategories = Array.from(new Set(events.map(e => e.category)));

  // Ranked Events by registrations
  const rankedEvents = [...filteredEvents].map(e => ({
    id: e.id,
    title: e.title,
    organization_name: e.organization_name,
    category: e.category,
    registrations_count: e.registrations?.length || 0,
    checkins_count: e.registrations?.filter((r: any) => r.checked_in_at).length || 0
  })).sort((a, b) => b.registrations_count - a.registrations_count);

  // 4. Intelligence insights
  const getIntelligenceInsight = () => {
    if (rankedEvents.length === 0) return "Add events to start gathering intelligence insights.";
    
    // Find highest category
    const sortedCats = [...catData].sort((a, b) => b.count - a.count);
    const topCategory = sortedCats[0]?.category || "Technology";

    return `${topCategory} workshops hold the highest attendance traction on the platform.`;
  };

  const insightMsg = getIntelligenceInsight();

  const handleExport = () => {
    const csvData = rankedEvents.map(e => ({
      EventID: e.id,
      Title: e.title,
      HostOrg: e.organization_name,
      Category: e.category,
      TicketsSold: e.registrations_count,
      AttendanceCheckins: e.checkins_count,
      AttendanceRate: e.registrations_count > 0 ? `${Math.round((e.checkins_count / e.registrations_count) * 100)}%` : "0%"
    }));
    exportToCSV(csvData, "eventic_general_analytics.csv");
    toast.success("Event analytics CSV downloaded successfully");
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      <div className="flex justify-between items-center">
        <AdminHeader
          title="Platform Analytics Summary"
          description="Access cross-event registration timelines, check-in flows, and category distributions"
        />
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

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

      {/* Intelligence Insight banner */}
      <div className="bg-white/10 border border-neutral-850 p-4 rounded-3xl flex items-center gap-3 text-xs text-white">
        <Award className="h-5 w-5 text-amber-400 shrink-0" />
        <span className="font-bold">{insightMsg}</span>
      </div>

      {/* Intelligence KPI Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 text-xs">
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Total Registrations</span>
            <Users className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{totalAdmissions}</h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Growth trend active
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Gate Check-ins</span>
            <Target className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{totalCheckins}</h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1.5">Verified scanner admissions</p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Average Attendance Rate</span>
            <BarChart3 className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{attendanceRate}%</h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1.5">Check-in ratio across fests</p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Active Events Catalog</span>
            <Calendar className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{filteredEvents.length}</h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1.5">Published listings counted</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Daily Registration Velocity</h3>
            <p className="text-[10px] text-neutral-500 font-bold">Total ticket registrations processed over time</p>
          </div>
          <div className="pt-2">
            <RegistrationTrendChart data={activeTrendData} />
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Registrations by Category</h3>
            <p className="text-[10px] text-neutral-500 font-bold">Distribution of audience interests across fests</p>
          </div>
          <div className="pt-2 flex justify-center">
            {catData.length > 0 ? (
              <CategoryDoughnutChart data={catData} />
            ) : (
              <p className="text-xs text-neutral-500 italic py-10">No categories distribution data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Popular Events Table */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Top Performing Events
        </h3>
        <div className="border border-neutral-900 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3 pl-4">Event Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Host Org</th>
                <th className="p-3">Tickets Sold</th>
                <th className="p-3">Check-ins Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              {rankedEvents.slice(0, 5).map((evt) => (
                <tr key={evt.id} className="hover:bg-neutral-900/10">
                  <td className="p-3 pl-4 font-bold text-white">
                    {evt.title}
                  </td>
                  <td className="p-3">
                    {evt.category}
                  </td>
                  <td className="p-3">
                    {evt.organization_name}
                  </td>
                  <td className="p-3 text-white font-mono font-bold">
                    {evt.registrations_count}
                  </td>
                  <td className="p-3 text-white font-mono font-bold">
                    {evt.registrations_count > 0 ? `${Math.round((evt.checkins_count / evt.registrations_count) * 100)}%` : "0%"}
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
