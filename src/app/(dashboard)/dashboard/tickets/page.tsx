import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getUserRegisteredEvents } from "@/services/dashboard";

export default async function TicketsPage() {
    await requireUser("/dashboard/tickets");

    const registrations =
        await getUserRegisteredEvents();

    const now = new Date();

    const upcomingTickets =
        registrations
            .filter(
                (registration: any) =>
                    registration.events &&
                    new Date(
                        registration.events.starts_at
                    ) >= now
            )
            .sort(
                (a: any, b: any) =>
                    new Date(
                        a.events.starts_at
                    ).getTime() -
                    new Date(
                        b.events.starts_at
                    ).getTime()
            );

    const attendedTickets =
        registrations
            .filter(
                (registration: any) =>
                    registration.checked_in
            )
            .sort(
                (a: any, b: any) =>
                    new Date(
                        b.checked_in_at ??
                        b.created_at
                    ).getTime() -
                    new Date(
                        a.checked_in_at ??
                        a.created_at
                    ).getTime()
            );

    const pastTickets =
        registrations
            .filter(
                (registration: any) => {
                    const event =
                        registration.events;

                    if (!event) return false;

                    return (
                        new Date(
                            event.starts_at
                        ) < now &&
                        !registration.checked_in
                    );
                }
            )
            .sort(
                (a: any, b: any) =>
                    new Date(
                        b.events.starts_at
                    ).getTime() -
                    new Date(
                        a.events.starts_at
                    ).getTime()
            );

    function TicketCard({
        registration,
    }: {
        registration: any;
    }) {
        const event =
            registration.events;

        const payment =
            registration.payments?.[0];

        return (
            <div className="rounded-2xl border p-5 space-y-4">
                <div>
                    <h3 className="text-xl font-semibold">
                        {event.title}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                        {event.venue}
                    </p>
                </div>

                <div className="space-y-2 text-sm">
                    <p>
                        📅{" "}
                        {new Date(
                            event.starts_at
                        ).toLocaleString()}
                    </p>

                    <p>
                        🎟️{" "}
                        {event.is_paid
                            ? `₹${event.ticket_price}`
                            : "Free"}
                    </p>

                    <p>
                        Payment:{" "}
                        <span className="font-medium">
                            {payment?.status ??
                                "Free Event"}
                        </span>
                    </p>

                    <p>
                        Status:{" "}
                        <span className="font-medium">
                            {registration.checked_in
                                ? "Checked In"
                                : "Registered"}
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href={`/tickets/${registration.id}`}
                        className="rounded-xl bg-black text-white px-4 py-2"
                    >
                        View Ticket
                    </Link>

                    <Link
                        href={`/events/${event.slug}`}
                        className="rounded-xl border px-4 py-2"
                    >
                        Event Page
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-bold">
                    My Tickets
                </h1>

                <p className="text-muted-foreground mt-2">
                    All your registrations,
                    tickets and event history.
                </p>
            </div>

            {/* Upcoming */}

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">
                    Upcoming Events
                </h2>

                {upcomingTickets.length ===
                0 ? (
                    <div className="rounded-xl border p-6 text-muted-foreground">
                        No upcoming events.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {upcomingTickets.map(
                            (
                                registration: any
                            ) => (
                                <TicketCard
                                    key={
                                        registration.id
                                    }
                                    registration={
                                        registration
                                    }
                                />
                            )
                        )}
                    </div>
                )}
            </section>

            {/* Attended */}

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">
                    Attended Events
                </h2>

                {attendedTickets.length ===
                0 ? (
                    <div className="rounded-xl border p-6 text-muted-foreground">
                        No attended events yet.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {attendedTickets.map(
                            (
                                registration: any
                            ) => (
                                <TicketCard
                                    key={
                                        registration.id
                                    }
                                    registration={
                                        registration
                                    }
                                />
                            )
                        )}
                    </div>
                )}
            </section>

            {/* Past */}

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">
                    Past Events
                </h2>

                {pastTickets.length ===
                0 ? (
                    <div className="rounded-xl border p-6 text-muted-foreground">
                        No past events.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {pastTickets.map(
                            (
                                registration: any
                            ) => (
                                <TicketCard
                                    key={
                                        registration.id
                                    }
                                    registration={
                                        registration
                                    }
                                />
                            )
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}