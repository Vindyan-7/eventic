import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/services/dashboard";

import { StatsCard } from "@/components/dashboard/stats-card";
import { LogoutButton } from "@/components/shared/logout-button";

import {
    Calendar,
    Ticket,
    CheckCircle,
    IndianRupee,
    CreditCard,
} from "lucide-react";


import {
    getEventStatus,
    getEventStatusClasses,
} from "@/lib/event-status";

export default async function DashboardPage() {
    await requireUser("/dashboard");

    const dashboard =
        await getDashboardData();

    if (!dashboard) {
        return (
            <div>
                Failed to load dashboard.
            </div>
        );
    }

    const now = new Date();

    const upcomingEvents =
        dashboard.registrations.filter(
            (registration: any) =>
                registration.events &&
                new Date(
                    registration.events.starts_at
                ) > now
        );

    const completedEvents =
        dashboard.registrations.filter(
            (registration: any) =>
                registration.events &&
                new Date(
                    registration.events.starts_at
                ) <= now
        );

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Dashboard
                    </h1>

                    <p className="text-muted-foreground">
                        Welcome back,{" "}
                        {dashboard.profile?.full_name ??
                            "User"}
                    </p>
                </div>

                <LogoutButton />
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard
                    title="Registered Events"
                    value={
                        dashboard.stats
                            .totalRegistrations
                    }
                    icon={Ticket}
                />

                <StatsCard
                    title="Upcoming Events"
                    value={
                        dashboard.stats
                            .upcomingEvents
                    }
                    icon={Calendar}
                />

                <StatsCard
                    title="Checked In"
                    value={
                        dashboard.stats
                            .checkedInEvents
                    }
                    icon={CheckCircle}
                />

                <StatsCard
                    title="Paid Events"
                    value={
                        dashboard.stats
                            .paidEvents
                    }
                    icon={CreditCard}
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">
                    Quick Actions
                </h2>

                <div className="grid gap-4 md:grid-cols-3">

                    <Link
                        href="/events"
                        className="rounded-2xl border p-6 hover:bg-muted/30 transition"
                    >
                        <h3 className="font-semibold">
                            Discover Events
                        </h3>

                        <p className="text-sm text-muted-foreground mt-2">
                            Browse upcoming events and register.
                        </p>
                    </Link>

                    <Link
                        href="/dashboard/events"
                        className="rounded-2xl border p-6 hover:bg-muted/30 transition"
                    >
                        <h3 className="font-semibold">
                            My Tickets
                        </h3>

                        <p className="text-sm text-muted-foreground mt-2">
                            View all registered events and tickets.
                        </p>
                    </Link>

                    <Link
                        href="/dashboard/profile"
                        className="rounded-2xl border p-6 hover:bg-muted/30 transition"
                    >
                        <h3 className="font-semibold">
                            My Profile
                        </h3>

                        <p className="text-sm text-muted-foreground mt-2">
                            Manage your account information.
                        </p>
                    </Link>

                </div>
            </div>

            {/* Empty State */}
            {dashboard.registrations.length === 0 && (
                <div className="rounded-2xl border p-10 text-center">
                    <h2 className="text-2xl font-semibold">
                        🎟 No Event Registrations Yet
                    </h2>

                    <p className="text-muted-foreground mt-3">
                        Discover hackathons, workshops,
                        conferences and meetups happening now.
                    </p>

                    <Link
                        href="/events"
                        className="mt-6 inline-flex rounded-xl bg-black text-white px-5 py-3"
                    >
                        Browse Events
                    </Link>
                </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">
                        Upcoming Events
                    </h2>

                    <div className="grid gap-4">
                        {upcomingEvents.map(
                            (
                                registration: any
                            ) => {
                                const event =
                                    registration.events;

                                const payment =
                                    registration
                                        .payments?.[0];

                                return (
                                    <Link
                                        key={registration.id}
                                        href={`/dashboard/events/${registration.id}`}
                                        className="rounded-2xl border p-5 hover:bg-muted/30 transition"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    {event.title}
                                                </h3>

                                                <p className="text-sm text-muted-foreground">
                                                    {event.venue}
                                                </p>

                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {new Date(
                                                        event.starts_at
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    const status =
                                                        getEventStatus(
                                                            event.starts_at,
                                                            event.ends_at,
                                                            event.status
                                                        );
                                                    return (
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-sm ${getEventStatusClasses(
                                                                status
                                                            )}`}
                                                        >
                                                            {status}
                                                        </span>
                                                    );
                                                })()}

                                                <span className="rounded-full border px-3 py-1 text-sm">
                                                    {event.is_paid
                                                        ? `₹${event.ticket_price}`
                                                        : "Free"}
                                                </span>


                                                <span className="rounded-full border px-3 py-1 text-sm">
                                                    {payment?.status ??
                                                        "Free"}
                                                </span>

                                                <span
                                                    className={
                                                        registration.checked_in
                                                            ? "rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm"
                                                            : "rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-sm"
                                                    }
                                                >
                                                    {registration.checked_in
                                                        ? "Checked In"
                                                        : "Not Checked In"}
                                                </span>

                                            </div>

                                        </div>
                                    </Link>
                                );
                            }
                        )}
                    </div>
                </div>
            )}

            {/* Completed Events */}
            {completedEvents.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4">
                        Completed Events
                    </h2>

                    <div className="grid gap-4">
                        {completedEvents.map(
                            (
                                registration: any
                            ) => {
                                const event =
                                    registration.events;

                                const payment =
                                    registration
                                        .payments?.[0];

                                return (
                                    <Link
                                        key={registration.id}
                                        href={`/dashboard/events/${registration.id}`}
                                        className="rounded-2xl border p-5 opacity-80 hover:bg-muted/30 transition"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    {event.title}
                                                </h3>

                                                <p className="text-sm text-muted-foreground">
                                                    {event.venue}
                                                </p>

                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {new Date(
                                                        event.starts_at
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    const status =
                                                        getEventStatus(
                                                            event.starts_at,
                                                            event.ends_at,
                                                            event.status
                                                        );
                                                    return (
                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-sm ${getEventStatusClasses(
                                                                status
                                                            )}`}
                                                        >
                                                            {status}
                                                        </span>
                                                    );
                                                })()}

                                                <span className="rounded-full border px-3 py-1 text-sm">
                                                    {event.is_paid
                                                        ? `₹${event.ticket_price}`
                                                        : "Free"}
                                                </span>


                                                <span className="rounded-full border px-3 py-1 text-sm">
                                                    {payment?.status ??
                                                        "Free"}
                                                </span>

                                                <span
                                                    className={
                                                        registration.checked_in
                                                            ? "rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm"
                                                            : "rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-sm"
                                                    }
                                                >
                                                    {registration.checked_in
                                                        ? "Checked In"
                                                        : "Not Checked In"}
                                                </span>

                                            </div>

                                        </div>
                                    </Link>
                                );
                            }
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}