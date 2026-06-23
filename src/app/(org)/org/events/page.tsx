import Link from "next/link";
import { requireOrgAdmin } from "@/lib/org-auth";
import { getOrganizationEvents } from "@/services/org-dashboard";
import {
    getEventStatus,
    getEventStatusClasses,
} from "@/lib/event-status";

export default async function OrgEventsPage() {
    await requireOrgAdmin("/org/events");

    const events =
        await getOrganizationEvents();

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        My Events
                    </h1>

                    <p className="text-muted-foreground mt-2">
                        Manage your created events.
                    </p>
                </div>

                <Link
                    href="/org/events/create"
                    className="rounded-xl bg-black text-white px-5 py-3 text-center"
                >
                    Create Event
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="rounded-2xl border p-10 text-center">
                    <h2 className="text-xl font-semibold">
                        No Events Yet
                    </h2>

                    <p className="text-muted-foreground mt-2">
                        Create your first event to start accepting registrations.
                    </p>

                    <Link
                        href="/org/events/create"
                        className="inline-block mt-6 rounded-xl bg-black text-white px-5 py-3"
                    >
                        Create Event
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {events.map((event: any) => (
                        <div
                            key={event.id}
                            className="rounded-2xl border p-6 space-y-5 hover:shadow-md transition-shadow"
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-xl sm:text-2xl font-semibold">
                                        {event.title}
                                    </h2>

                                    {(() => {
                                        const status = getEventStatus(
                                            event.starts_at,
                                            event.ends_at,
                                            event.status
                                        );
                                        return (
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-medium ${getEventStatusClasses(
                                                    status
                                                )}`}
                                            >
                                                {status}
                                            </span>
                                        );
                                    })()}

                                </div>

                                <p className="text-sm text-muted-foreground mt-2">
                                    {event.venue || "No venue specified"}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        event.starts_at
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/30 p-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Registrations
                                    </p>

                                    <p className="text-lg font-semibold">
                                        {event.event_registrations?.length || 0}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Ticket
                                    </p>

                                    <p className="text-lg font-semibold">
                                        {event.is_paid
                                            ? `₹${event.ticket_price}`
                                            : "Free"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={`/org/events/${event.id}`}
                                    className="flex-1 rounded-lg border px-4 py-2 text-center"
                                >
                                    View
                                </Link>

                                <Link
                                    href={`/org/events/${event.id}/edit`}
                                    className="flex-1 rounded-lg border px-4 py-2 text-center"
                                >
                                    Edit
                                </Link>

                                <Link
                                    href={`/org/events/${event.id}/attendees`}
                                    className="flex-1 rounded-lg border px-4 py-2 text-center"
                                >
                                    Attendees
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}