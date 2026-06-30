"use client";

import { useState } from "react";
import { AdminHeader, AdminBadge } from "@/components/admin/ui";
import { RegistrationTrendChart, CategoryDoughnutChart } from "@/components/analytics/analytics-charts";
import { exportToCSV } from "@/lib/admin/export";
import { toast } from "sonner";
import { Building, Download, TrendingUp, ShieldCheck, Calendar, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrgRecord {
  id: string;
  name: string;
  verification_status: string;
  created_at: string;
  events: any[];
}

export function OrgsAnalyticsClient({ orgs }: { orgs: OrgRecord[] }) {
  const [filterRange, setFilterRange] = useState("all");

  const getFilteredOrgs = () => {
    if (filterRange === "all") return orgs;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - Number(filterRange));
    return orgs.filter(o => new Date(o.created_at) >= limitDate);
  };

  const filteredOrgs = getFilteredOrgs();

  // 1. Calculations - Total verified orgs count
  const verifiedCount = filteredOrgs.filter(o => o.verification_status === "verified").length;
  const pendingCount = filteredOrgs.filter(o => o.verification_status === "pending").length;
  const rejectedCount = filteredOrgs.filter(o => o.verification_status === "rejected").length;

  const donutData = [
    { category: "Verified Orgs", count: verifiedCount },
    { category: "Pending Approval", count: pendingCount },
    { category: "Rejected / Ignored", count: rejectedCount }
  ].filter(d => d.count > 0);

  // 2. Calculations - Growth over time
  const growthMap: Record<string, number> = {};
  filteredOrgs.forEach(o => {
    const dateStr = new Date(o.created_at).toISOString().split("T")[0];
    growthMap[dateStr] = (growthMap[dateStr] || 0) + 1;
  });

  const growthData = Object.entries(growthMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const activeGrowthData = growthData.length > 0 ? growthData : [{ date: new Date().toISOString().split("T")[0], count: 0 }];

  // 3. Average calculations
  const totalEvents = filteredOrgs.reduce((sum, o) => sum + (o.events?.length || 0), 0);
  const avgEventsPerOrg = (totalEvents / (filteredOrgs.length || 1)).toFixed(1);
  const totalRegistrations = filteredOrgs.reduce((sum, o) => sum + o.events.reduce((s: number, e: any) => s + (e.registrations_count || 0), 0), 0);
  const avgRegsPerEvent = (totalRegistrations / (totalEvents || 1)).toFixed(1);

  // Ranked organizers list
  const rankedOrgs = [...filteredOrgs].map(o => {
    const totalRegs = o.events.reduce((s: number, e: any) => s + (e.registrations_count || 0), 0);
    return {
      ...o,
      events_count: o.events?.length || 0,
      registrations_count: totalRegs
    };
  }).sort((a, b) => b.registrations_count - a.registrations_count);

  const handleExport = () => {
    const csvData = rankedOrgs.map(o => ({
      ID: o.id,
      Name: o.name,
      VerificationStatus: o.verification_status,
      CreatedDate: new Date(o.created_at).toLocaleString(),
      EventsHosted: o.events_count,
      TotalRegistrations: o.registrations_count
    }));
    exportToCSV(csvData, "eventic_organization_analytics.csv");
    toast.success("Organization analytics CSV downloaded successfully");
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      <div className="flex justify-between items-center">
        <AdminHeader
          title="Organization Analytics Center"
          description="Evaluate host growth rates, verified badge distribution, and audience acquisition ratios"
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
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Total Organizations</span>
            <Building className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{filteredOrgs.length}</h2>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-400">
              <TrendingUp className="h-3 w-3" /> Growth trend active
            </div>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Verified Hosts</span>
            <ShieldCheck className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{verifiedCount}</h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1.5">{Math.round((verifiedCount / (filteredOrgs.length || 1)) * 100)}% verified rate</p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Average Events / Host</span>
            <Calendar className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{avgEventsPerOrg}</h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1.5">Events hosted per workspace</p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Average Registrations</span>
            <Users className="h-4 w-4 text-neutral-500" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{avgRegsPerEvent}</h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-1.5">Signups per individual event listing</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Host Registration Velocity</h3>
            <p className="text-[10px] text-neutral-500 font-bold">New organizations registered over time</p>
          </div>
          <div className="pt-2">
            <RegistrationTrendChart data={activeGrowthData} />
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Trust Verifications Breakdown</h3>
            <p className="text-[10px] text-neutral-500 font-bold">Ratio of trusted verifications across platform</p>
          </div>
          <div className="pt-2 flex justify-center">
            {donutData.length > 0 ? (
              <CategoryDoughnutChart data={donutData} />
            ) : (
              <p className="text-xs text-neutral-500 italic py-10">No status distribution records available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Active Organizations */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Top Performing Organizations
        </h3>
        <div className="border border-neutral-900 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3 pl-4">Host Name</th>
                <th className="p-3">Verification Badge</th>
                <th className="p-3">Events Created</th>
                <th className="p-3">Total Ticket Signups</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              {rankedOrgs.slice(0, 5).map((org) => (
                <tr key={org.id} className="hover:bg-neutral-900/10">
                  <td className="p-3 pl-4 font-bold text-white">
                    {org.name}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      org.verification_status === "verified" ? "text-emerald-400" :
                      org.verification_status === "pending" ? "text-amber-400" :
                      "text-neutral-500"
                    }`}>
                      {org.verification_status}
                    </span>
                  </td>
                  <td className="p-3 text-white font-mono">
                    {org.events_count}
                  </td>
                  <td className="p-3 text-white font-mono font-bold">
                    {org.registrations_count}
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
