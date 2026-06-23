import Link from "next/link";
import { requireOrgAdmin } from "@/lib/org-auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { getOrganizationAnalytics } from "@/services/org-dashboard";

import {
    Calendar,
    Users,
    IndianRupee,
    CheckCircle,
    Activity,
    Clock,
    CheckCircle2,
} from "lucide-react";

export default async function OrgAnalyticsPage() {
    await requireOrgAdmin("/org/analytics");

    const analytics =
        await getOrganizationAnalytics();

    if (!analytics) {
        return (
            <div>
                Failed to load analytics.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Analytics
                    </h1>

                    <p className="text-muted-foreground">
                        Overview of your events, registrations and revenue.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/org/events"
                        className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        Manage Events
                    </Link>
                    <Link
                        href="/org/events/create"
                        className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90 transition-colors"
                    >
                        Create Event
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatsCard
                        title="Total Events"
                        value={analytics.totalEvents}
                        icon={Calendar}
                    />

                    <StatsCard
                        title="Registrations"
                        value={analytics.totalRegistrations}
                        icon={Users}
                    />

                    <StatsCard
                        title="Revenue"
                        value={`₹${analytics.totalRevenue.toLocaleString()}`}
                        icon={IndianRupee}
                    />

                    <StatsCard
                        title="Attendance"
                        value={`${analytics.attendanceRate}%`}
                        description={`${analytics.totalCheckIns} checked in`}
                        icon={CheckCircle}
                    />
                </div>

                {/* Event Status Breakdown */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatsCard
                        title="Upcoming Events"
                        value={analytics.upcomingCount}
                        icon={Clock}
                    />

                    <StatsCard
                        title="Live Events"
                        value={analytics.liveCount}
                        icon={Activity}
                    />

                    <StatsCard
                        title="Completed Events"
                        value={analytics.completedCount}
                        icon={CheckCircle2}
                    />
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Events */}
                <div className="rounded-2xl border p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Top Events
                    </h2>

                    <div className="space-y-4">
                        {analytics.topEvents.length === 0 ? (
                            <p className="text-muted-foreground">
                                No events yet.
                            </p>
                        ) : (
                            analytics.topEvents.map((event: any) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {event.title}
                                        </p>
                                    </div>

                                    <span className="text-sm text-muted-foreground">
                                        {event.event_registrations?.length ?? 0} registrations
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="rounded-2xl border p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Upcoming Events
                    </h2>

                    <div className="space-y-4">
                        {analytics.upcomingEvents.length === 0 ? (
                            <p className="text-muted-foreground">
                                No upcoming events.
                            </p>
                        ) : (
                            analytics.upcomingEvents.map((event: any) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {event.title}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            {new Date(event.starts_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <span className="text-sm">
                                        {event.event_registrations?.length ?? 0} regs
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Revenue Leaders */}
                <div className="rounded-2xl border p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Revenue Leaders
                    </h2>

                    <div className="space-y-4">
                        {analytics.revenueByEvent.length === 0 ? (
                            <p className="text-muted-foreground">
                                No revenue data.
                            </p>
                        ) : (
                            analytics.revenueByEvent.map((event: any) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {event.title}
                                        </p>
                                    </div>

                                    <span className="text-sm font-semibold">
                                        ₹{event.revenue.toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Attendance Leaders */}
                <div className="rounded-2xl border p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Attendance Leaders
                    </h2>

                    <div className="space-y-4">
                        {analytics.attendanceByEvent.length === 0 ? (
                            <p className="text-muted-foreground">
                                No attendance data.
                            </p>
                        ) : (
                            analytics.attendanceByEvent.map((event: any) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {event.title}
                                        </p>
                                    </div>

                                    <span className="text-sm font-semibold">
                                        {Math.round(event.rate)}%
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Registrations */}
                <div className="rounded-2xl border p-6 lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">
                        Recent Registrations
                    </h2>

                    {analytics.recentRegistrations.length === 0 ? (
                        <p className="text-muted-foreground">
                            No recent registrations.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="pb-3 font-medium">Attendee Name</th>
                                        <th className="pb-3 font-medium">Event Name</th>
                                        <th className="pb-3 font-medium">Registration Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {analytics.recentRegistrations.map((reg: any, i: number) => (
                                        <tr key={i} className="hover:bg-muted/10 transition-colors">
                                            <td className="py-3 font-medium">{reg.attendeeName}</td>
                                            <td className="py-3 text-muted-foreground">{reg.eventTitle}</td>
                                            <td className="py-3 text-muted-foreground">
                                                {new Date(reg.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}