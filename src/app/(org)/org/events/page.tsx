import Link from "next/link";
import { requireOrgAdmin } from "@/lib/org-auth";
import { getOrganizationEvents } from "@/services/org-dashboard";

export default async function OrgEventsPage() {
    await requireOrgAdmin();

    const events =
        await getOrganizationEvents();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold">
                        My Events
                    </h1>

                    <p className="text-muted-foreground mt-2">
                        Manage your created events.
                    </p>
                </div>

                <Link
                    href="/org/events/create"
                    className="rounded-xl bg-black text-white px-5 py-3"
                >
                    Create Event
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {events.map((event: any) => (
                    <div
                        key={event.id}
                        className="rounded-2xl border p-6 space-y-4"
                    >
                        <div>
                            <h2 className="text-2xl font-semibold">
                                {event.title}
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                {event.venue}
                            </p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span>
                                Registrations:
                                {" "}
                                {event.event_registrations?.length || 0}
                            </span>

                            <span>
                                {event.is_paid
                                    ? `₹${event.ticket_price}`
                                    : "Free"}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href={`/org/events/${event.id}`}
                                className="rounded-lg border px-4 py-2"
                            >
                                View
                            </Link>

                            <button className="rounded-lg border px-4 py-2">
                                Edit
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}