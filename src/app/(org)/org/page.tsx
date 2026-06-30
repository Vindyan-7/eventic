import Link from "next/link";

import { requireWorkspace } from "@/lib/workspace-auth";
import { getOrganizationAnalytics } from "@/services/org-dashboard";


import {
    Calendar,
    Users,
    IndianRupee,
    CheckCircle,
    ArrowRight,
} from "lucide-react";

import {
    getEventStatus,
    getEventStatusClasses,
} from "@/lib/event-status";

export default async function OrgDashboardPage() {
    const { workspace } = await requireWorkspace();

    const analytics =
        await getOrganizationAnalytics(workspace.id);


    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        Organization Dashboard
                    </h1>

                    <p className="text-muted-foreground mt-2">
                        Track registrations, attendance,
                        revenue and event performance.
                    </p>
                </div>

                <Link
                    href="/org/events/create"
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white"
                >
                    Create Event
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-2xl border p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Total Events
                        </p>

                        <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <h2 className="mt-4 text-4xl font-bold">
                        {analytics?.totalEvents || 0}
                    </h2>
                </div>

                <div className="rounded-2xl border p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Registrations
                        </p>

                        <Users className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <h2 className="mt-4 text-4xl font-bold">
                        {analytics?.totalRegistrations || 0}
                    </h2>
                </div>

                <div className="rounded-2xl border p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Revenue
                        </p>

                        <IndianRupee className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <h2 className="mt-4 text-4xl font-bold">
                        ₹{analytics?.totalRevenue || 0}
                    </h2>
                </div>

                <div className="rounded-2xl border p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Attendance Rate
                        </p>

                        <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <h2 className="mt-4 text-4xl font-bold">
                        {analytics?.attendanceRate || 0}%
                    </h2>
                </div>

            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">
                    Quick Actions
                </h2>

                <div className="grid gap-4 md:grid-cols-3">

                    <Link
                        href="/org/events/create"
                        className="rounded-2xl border p-6 hover:bg-muted/30 transition"
                    >
                        <h3 className="font-semibold">
                            Create Event
                        </h3>

                        <p className="text-sm text-muted-foreground mt-2">
                            Launch a new event for your audience.
                        </p>
                    </Link>

                    <Link
                        href="/org/events"
                        className="rounded-2xl border p-6 hover:bg-muted/30 transition"
                    >
                        <h3 className="font-semibold">
                            Manage Events
                        </h3>

                        <p className="text-sm text-muted-foreground mt-2">
                            Edit and monitor your events.
                        </p>
                    </Link>

                    <Link
                        href="/org/payouts"
                        className="rounded-2xl border p-6 hover:bg-muted/30 transition relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                                Payouts
                            </h3>
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Coming Soon</span>
                        </div>

                        <p className="text-sm text-muted-foreground mt-2">
                            View earnings and request withdrawals.
                        </p>
                    </Link>

                </div>
            </div>

            {/* Upcoming Events */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">
                        Upcoming Events
                    </h2>

                    <Link
                        href="/org/events"
                        className="text-sm flex items-center gap-1 text-primary"
                    >
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="rounded-2xl border overflow-hidden">

                    {analytics?.upcomingEvents?.length ? (
                        <div className="divide-y">

                            {analytics.upcomingEvents.map(
                                (event: any) => (
                                    <div
                                        key={event.id}
                                        className="p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold">
                                                {event.title}
                                            </h3>

                                            {(() => {
                                                const status =
                                                    getEventStatus(
                                                        event.starts_at,
                                                        event.ends_at,
                                                        event.status
                                                    );
                                                return (
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getEventStatusClasses(
                                                            status
                                                        )}`}
                                                    >
                                                        {status}
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        <div className="text-sm">
                                            {
                                                event
                                                    .event_registrations
                                                    ?.length
                                            }{" "}
                                            registrations
                                        </div>
                                    </div>
                                )
                            )}

                        </div>
                    ) : (
                        <div className="p-10 text-center text-muted-foreground">
                            No upcoming events.
                        </div>
                    )}

                </div>
            </div>

            {/* Top Performing Events */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">
                    Top Performing Events
                </h2>

                <div className="rounded-2xl border overflow-hidden">

                    {analytics?.topEvents?.length ? (
                        <div className="divide-y">

                            {analytics.topEvents.map(
                                (
                                    event: any,
                                    index: number
                                ) => (
                                    <div
                                        key={event.id}
                                        className="p-5 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold">
                                                {event.title}
                                            </h3>

                                            {(() => {
                                                const status =
                                                    getEventStatus(
                                                        event.starts_at,
                                                        event.ends_at,
                                                        event.status
                                                    );
                                                return (
                                                    <span
                                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getEventStatusClasses(
                                                            status
                                                        )}`}
                                                    >
                                                        {status}
                                                    </span>
                                                );
                                            })()}
                                        </div>


                                        <div className="font-medium">
                                            {
                                                event
                                                    .event_registrations
                                                    ?.length
                                            }{" "}
                                            registrations
                                        </div>
                                    </div>
                                )
                            )}

                        </div>
                    ) : (
                        <div className="p-10 text-center text-muted-foreground">
                            No event data available.
                        </div>
                    )}

                </div>
            </div>

        </div>
    );
}