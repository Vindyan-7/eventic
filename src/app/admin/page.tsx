import { requireAdmin } from "@/lib/admin/auth";
import {
  AdminHeader,
  AdminStatsCard,
  AdminCard,
  AdminTable,
  AdminBadge
} from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building,
  Calendar,
  Ticket,
  QrCode,
  Shield,
  Activity,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const adminClient = await createAdminClient();

  // 1. Total & New Users
  const { count: usersCount } = await adminClient
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { count: newUsersToday } = await adminClient
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString());

  // 2. Organizations & Verified
  const { count: orgsCount } = await adminClient
    .from("organizations")
    .select("*", { count: "exact", head: true });

  const { count: verifiedOrgsCount } = await adminClient
    .from("organizations")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "verified");

  // 3. Events: Created, Upcoming, Featured
  const { count: eventsCreated } = await adminClient
    .from("events")
    .select("*", { count: "exact", head: true });

  const nowStr = new Date().toISOString();
  const { count: upcomingEvents } = await adminClient
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .gt("starts_at", nowStr);

  const { count: featuredEvents } = await adminClient
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("is_featured", true);

  // 4. Registrations: Today, Week, Month
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const { count: regsToday } = await adminClient
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart.toISOString());

  const { count: regsWeek } = await adminClient
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  const { count: regsMonth } = await adminClient
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthAgo.toISOString());

  // 5. Check-ins Today & Attendance Rate
  const { count: checkinsToday } = await adminClient
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .not("checked_in_at", "is", null)
    .gte("checked_in_at", todayStart.toISOString());

  const { count: totalRegs } = await adminClient
    .from("event_registrations")
    .select("*", { count: "exact", head: true });

  const { count: totalCheckins } = await adminClient
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .not("checked_in_at", "is", null);

  const attendanceRate = totalRegs && totalCheckins ? Math.round((totalCheckins / totalRegs) * 100) : 0;

  // 6. Scanner Sessions
  const { count: scannerCount } = await adminClient
    .from("event_scan_codes")
    .select("*", { count: "exact", head: true })
    .gt("expires_at", nowStr);

  // Query category distribution for mini chart
  const { data: eventsCats } = await adminClient
    .from("events")
    .select("category");

  const catMap: Record<string, number> = {};
  (eventsCats || []).forEach((e: any) => {
    const cat = e.category || "General";
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const categoriesList = Object.entries(catMap).map(([name, count]) => ({ name, count }));

  // Query recent platform operations logs
  const { data: auditLogs } = await adminClient
    .from("admin_audit_logs")
    .select(`
      *,
      admin:admin_id (
        role,
        profile:user_id (
          email
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { title: "Total Users", value: (usersCount || 0).toLocaleString(), description: `${newUsersToday || 0} registered today`, icon: Users, link: "/admin/analytics/users" },
    { title: "Organizations", value: (orgsCount || 0).toLocaleString(), description: `${verifiedOrgsCount || 0} trusted badges issued`, icon: Building, link: "/admin/analytics/organizations" },
    { title: "Active Events", value: (eventsCreated || 0).toLocaleString(), description: `${upcomingEvents || 0} upcoming public fests`, icon: Calendar, link: "/admin/analytics" },
    { title: "Total Registrations", value: (totalRegs || 0).toLocaleString(), description: `${regsToday || 0} bookings today`, icon: Ticket, link: "/admin/analytics" },
    { title: "Attendance Rate", value: `${attendanceRate}%`, description: `${totalCheckins || 0} total check-ins checked`, icon: Activity, link: "/admin/analytics" },
    { title: "Scanner Sessions", value: (scannerCount || 0).toLocaleString(), description: "Active entry credentials", icon: QrCode, link: "/admin/analytics/scanners" }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <AdminHeader
          title="Eventic Platform Control Center"
          description={`Welcome back, ${admin.full_name || admin.email}. Console role: ${admin.role}`}
        />
        <div className="flex gap-2">
          <Link href="/admin/analytics/users">
            <Button size="sm" variant="outline" className="text-xs text-white border-neutral-850 hover:bg-neutral-900 cursor-pointer h-9 rounded-xl">
              User Insights
            </Button>
          </Link>
          <Link href="/admin/analytics/organizations">
            <Button size="sm" variant="outline" className="text-xs text-white border-neutral-850 hover:bg-neutral-900 cursor-pointer h-9 rounded-xl">
              Host Insights
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Insight Card Banner */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 flex items-center justify-between text-xs font-sans">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-extrabold text-white block">Platform Activity Peak Notice</span>
            <p className="text-neutral-500 text-[10px] mt-0.5">Tickets booked this month: {regsMonth || 0}. Weekly tickets pace: {regsWeek || 0}.</p>
          </div>
        </div>
        <Link href="/admin/analytics" className="text-white font-bold hover:underline flex items-center gap-1">
          Full Intelligence <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Grid of Stats */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, idx) => (
          <Link key={idx} href={s.link} className="block transition-transform hover:scale-[1.01]">
            <AdminStatsCard
              title={s.title}
              value={s.value}
              description={s.description}
              icon={s.icon}
            />
          </Link>
        ))}
      </div>

      {/* Mini Charts & Categories breakdown */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Categories Distribution */}
        <AdminCard className="space-y-4 lg:col-span-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">Events Distribution by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {categoriesList.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-6">No event categories recorded.</p>
            ) : (
              categoriesList.slice(0, 6).map((cat, idx) => {
                const maxCatCount = Math.max(...categoriesList.map(c => c.count), 1);
                const pct = (cat.count / maxCatCount) * 100;
                return (
                  <div key={idx} className="space-y-1 bg-neutral-900/10 border border-neutral-900 p-3 rounded-2xl">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-white">{cat.name}</span>
                      <span className="text-neutral-400 font-bold">{cat.count} events</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div style={{ width: `${pct}%` }} className="bg-white h-full" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </AdminCard>

        {/* System parameters summary */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-white" /> System Configuration
          </h2>
          <AdminCard className="space-y-4">
            <div>
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Platform DB</span>
              <p className="text-xs font-bold text-white mt-1">Supabase Managed (RLS Enforced)</p>
            </div>
            <div>
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Active Scanner Staff</span>
              <p className="text-xs font-bold text-white mt-1">{scannerCount || 0} checkin gates live</p>
            </div>
            <div>
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Featured listings</span>
              <p className="text-xs font-bold text-white mt-1">{featuredEvents || 0} fests featured</p>
            </div>
            <div>
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Active Role</span>
              <div className="mt-1.5">
                <AdminBadge role={admin.role} className="text-[9px]" />
              </div>
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Platform activity log feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-white" /> Recent Administrative Operations
        </h2>
        {!auditLogs || auditLogs.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-6">No administrative audit records found.</p>
        ) : (
          <AdminTable headers={["Action", "Entity", "Target ID", "Executor", "Timestamp"]}>
            {auditLogs.map((log) => (
              <tr key={log.id} className="text-neutral-300 hover:bg-neutral-900/20 transition-colors">
                <td className="p-4 font-mono text-xs text-white">{log.action}</td>
                <td className="p-4 text-xs">{log.entity}</td>
                <td className="p-4 font-mono text-xs text-neutral-500">{log.entity_id || "n/a"}</td>
                <td className="p-4 text-xs text-neutral-400">
                  {(log.admin as any)?.profile?.email || "system"}
                </td>
                <td className="p-4 text-xs text-neutral-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    </div>
  );
}
