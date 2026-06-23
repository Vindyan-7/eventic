import Link from "next/link";
import Image from "next/image";

import { requireUser } from "@/lib/auth";
import { getUserRegisteredEvents } from "@/services/dashboard";

import {
  getEventStatus,
  getEventStatusClasses,
} from "@/lib/event-status";

function EventCard({
  registration,
}: {
  registration: any;
}) {
  const event =
    registration.events;

  const payment =
    registration.payments?.[0];

  const status =
    getEventStatus(
      event.starts_at,
      event.ends_at,
      event.status
    );

  return (
    <div className="overflow-hidden rounded-2xl border bg-background hover:shadow-lg transition-all">

      <div className="relative h-48">

        <Image
          src={
            event.banner_url ||
            "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1200&auto=format&fit=crop"
          }
          alt={event.title}
          fill
          className="object-cover"
        />

      </div>

      <div className="p-5 space-y-4">

        <div>

          <div className="flex flex-wrap items-center gap-2 mb-2">

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${getEventStatusClasses(
                status
              )}`}
            >
              {status}
            </span>

            <span className="rounded-full border px-3 py-1 text-xs">
              {event.is_paid
                ? `₹${event.ticket_price}`
                : "Free"}
            </span>

          </div>

          <h2 className="text-xl font-bold">
            {event.title}
          </h2>

          <p className="text-xs font-medium text-primary mt-1">
            {new Date(event.starts_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>

          <p className="text-sm text-muted-foreground mt-2">
            {
              event.organizations
                ?.name
            }
          </p>

        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {event.description}
        </p>

        <div className="space-y-2 text-sm">

          <p>
            📍 {event.venue}
          </p>

          <p>
            📅{" "}
            {new Date(
              event.starts_at
            ).toLocaleDateString()}
          </p>

          <p>
            Payment:
            {" "}
            <span className="font-medium">
              {payment?.status ??
                "Free Event"}
            </span>
          </p>

          <p>
            Check-In:
            {" "}
            <span
              className={
                registration.checked_in
                  ? "text-green-600 font-medium"
                  : "font-medium"
              }
            >
              {registration.checked_in
                ? "Checked In"
                : "Not Checked In"}
            </span>
          </p>

          <p className="text-[10px] text-muted-foreground pt-2">
            Registered on {new Date(registration.created_at).toLocaleDateString("en-IN")}
          </p>

        </div>

        <div className="flex gap-3">

          <Link
            href={`/dashboard/events/${registration.id}`}
            className="flex-1 rounded-xl bg-black text-white text-center py-2"
          >
            View Ticket
          </Link>

          <Link
            href={`/events/${event.slug}`}
            className="flex-1 rounded-xl border text-center py-2"
          >
            Event Page
          </Link>

        </div>

      </div>

    </div>
  );
}

export default async function DashboardEventsPage() {
  await requireUser("/dashboard/events");

  const registrations =
    await getUserRegisteredEvents();

  const liveEvents = registrations
    .filter((registration: any) => {
      const status = getEventStatus(
        registration.events.starts_at,
        registration.events.ends_at,
        registration.events.status
      );
      return status === "Live";
    });

  const upcomingEvents = registrations
    .filter((registration: any) => {
      const status = getEventStatus(
        registration.events.starts_at,
        registration.events.ends_at,
        registration.events.status
      );
      return status === "Upcoming";
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.events.starts_at).getTime() -
        new Date(b.events.starts_at).getTime()
    );

  const completedEvents = registrations
    .filter((registration: any) => {
      const status = getEventStatus(
        registration.events.starts_at,
        registration.events.ends_at,
        registration.events.status
      );
      return status === "Completed";
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.events.starts_at).getTime() -
        new Date(a.events.starts_at).getTime()
    );

  return (
    <div className="space-y-10">

      <div>
        <h1 className="text-4xl font-bold">
          My Events
        </h1>

        <p className="text-muted-foreground mt-2">
          All your registrations,
          tickets and event history.
        </p>
      </div>

      {registrations.length ===
        0 ? (
        <div className="rounded-2xl border p-12 text-center">

          <h2 className="text-2xl font-semibold">
            No Events Yet
          </h2>

          <p className="text-muted-foreground mt-2">
            Register for your
            first event to see
            tickets here.
          </p>

          <Link
            href="/events"
            className="inline-flex mt-6 rounded-xl bg-black text-white px-6 py-3"
          >
            Browse Events
          </Link>

        </div>
      ) : (
        <>
          {liveEvents.length >
            0 && (
              <section className="space-y-5">

                <h2 className="text-2xl font-bold">
                  🔴 Live Events
                </h2>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {liveEvents.map(
                    (
                      registration: any
                    ) => (
                      <EventCard
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

              </section>
            )}

          {upcomingEvents.length >
            0 && (
              <section className="space-y-5">

                <h2 className="text-2xl font-bold">
                  🟢 Upcoming Events
                </h2>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {upcomingEvents.map(
                    (
                      registration: any
                    ) => (
                      <EventCard
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

              </section>
            )}

          {completedEvents.length >
            0 && (
              <section className="space-y-5">

                <h2 className="text-2xl font-bold">
                  ⚫ Completed Events
                </h2>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {completedEvents.map(
                    (
                      registration: any
                    ) => (
                      <EventCard
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

              </section>
            )}
        </>
      )}

    </div>
  );
}