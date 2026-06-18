import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserRegisteredEvents } from "@/services/dashboard";

export default async function DashboardEventsPage() {
  await requireUser();

  const registrations =
    await getUserRegisteredEvents();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          My Events
        </h1>

        <p className="text-muted-foreground mt-2">
          Events you registered for.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {registrations.map((registration: any) => {
          const event = registration.events;

          const payment =
            registration.payments?.[0];

          return (
            <div
              key={registration.id}
              className="rounded-2xl border p-6"
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {event.title}
                  </h2>
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
                    💳{" "}
                    {event.is_paid
                      ? `₹${event.ticket_price}`
                      : "Free"}
                  </p>

                  <p>
                    Payment Status:{" "}
                    <span className="font-medium">
                      {payment?.status ??
                        "N/A"}
                    </span>
                  </p>

                  <p>
                    Check-In Status:{" "}
                    <span className="font-medium">
                      {registration.checked_in
                        ? "Checked In"
                        : "Not Checked In"}
                    </span>
                  </p>
                </div>

                <Link
                  href={`/dashboard/events/${registration.id}`}
                  className="inline-flex rounded-xl bg-black px-4 py-2 text-white"
                >
                  View Ticket
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}