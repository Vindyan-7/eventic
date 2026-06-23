import { requireOrgAdmin } from "@/lib/org-auth";
import { QRScanner } from "@/components/event/qr-scanner";
import { getOrganizationEvent } from "@/services/event-management";
import { notFound } from "next/navigation";

export default async function ScanPage({
    params,
}: {
    params: Promise<{
        eventId: string;
    }>;
}) {
    const { eventId } =
        await params;

    await requireOrgAdmin(`/org/events/${eventId}/scan`);

    const result =
        await getOrganizationEvent(
            eventId
        );

    if (
        result.error ||
        !result.data
    ) {
        notFound();
    }

    const event =
        result.data;

    return (
        <div className="max-w-6xl mx-auto space-y-8">

            {/* Header */}

            <div>
                <h1 className="text-4xl font-bold">
                    Ticket Scanner
                </h1>

                <p className="text-muted-foreground mt-2">
                    Scan attendee QR codes
                    and manage event entry.
                </p>
            </div>

            {/* Event Info */}

            <div className="rounded-2xl border p-6">

                <h2 className="text-2xl font-bold">
                    {event.title}
                </h2>

                <p className="text-muted-foreground mt-2">
                    {event.venue}
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                    {new Date(
                        event.starts_at
                    ).toLocaleString()}
                </p>

            </div>

            {/* Stats */}

            <div className="grid gap-4 md:grid-cols-4">

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Registrations
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {
                            event.registration_count
                        }
                    </p>
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Checked In
                    </p>

                    <p className="text-3xl font-bold mt-2 text-green-600">
                        {
                            event.checked_in_count
                        }
                    </p>
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Remaining
                    </p>

                    <p className="text-3xl font-bold mt-2 text-orange-600">
                        {
                            event.remaining_attendees
                        }
                    </p>
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Attendance
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {
                            event.attendance_rate
                        }%
                    </p>
                </div>

            </div>

            {/* Scanner */}

            <div className="rounded-2xl border p-6">

                <h3 className="text-xl font-semibold mb-4">
                    Scan Ticket
                </h3>

                <QRScanner
                    eventId={eventId}
                />

            </div>

        </div>
    );
}