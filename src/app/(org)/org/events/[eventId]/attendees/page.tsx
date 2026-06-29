export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { requireOrgAdminOrScanner } from "@/lib/org-auth";
import { getOrganizationEvent } from "@/services/event-management";
import { getEventAttendees } from "@/services/event-attendees";
import { AttendeeListClient } from "@/components/event/attendee-list-client";

export default async function EventAttendeesPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params;
    const { isScanner } = await requireOrgAdminOrScanner(eventId);

    const [eventResult, attendeesResult] =
        await Promise.all([
            getOrganizationEvent(eventId),
            getEventAttendees(eventId),
        ]);

    if (
        eventResult.error ||
        !eventResult.data
    ) {
        notFound();
    }

    if (
        attendeesResult.error ||
        !attendeesResult.data
    ) {
        throw new Error(
            attendeesResult.error
        );
    }

    const event = eventResult.data;
    const attendees = attendeesResult.data;

    return (
        <div className="space-y-8">

            {/* Header */}

            <div>
                <h1 className="text-4xl font-bold">
                    Attendees
                </h1>

                <p className="text-muted-foreground mt-2">
                    {event.title}
                </p>
            </div>

            {/* Interactive Attendee Client Dashboard */}
            <AttendeeListClient
                initialAttendees={attendees}
                eventMaxAttendees={event.max_attendees}
            />

        </div>
    );
}