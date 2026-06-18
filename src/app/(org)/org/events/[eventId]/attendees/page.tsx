export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { requireOrgAdmin } from "@/lib/org-auth";
import { getOrganizationEvent } from "@/services/event-management";
import { getEventAttendees } from "@/services/event-attendees";
import { CheckInButton } from "@/components/event/check-in-button";
export default async function EventAttendeesPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    await requireOrgAdmin();

    const { eventId } = await params;

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
            <div>
                <h1 className="text-4xl font-bold">
                    Attendees
                </h1>

                <p className="text-muted-foreground mt-2">
                    {event.title}
                </p>
            </div>

            <div className="rounded-2xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted">
    <tr>
        <th className="text-left p-4">
            Name
        </th>

        <th className="text-left p-4">
            Email
        </th>

        <th className="text-left p-4">
            Registered At
        </th>

        <th className="text-left p-4">
            Status
        </th>

        <th className="text-left p-4">
            Action
        </th>
    </tr>
</thead>

                    <tbody>
    {attendees.length === 0 ? (
        <tr>
            <td
                colSpan={5}
                className="p-8 text-center text-muted-foreground"
            >
                No attendees yet.
            </td>
        </tr>
    ) : (
        attendees.map((attendee) => (
            <tr
                key={attendee.registration_id}
                className="border-t"
            >
                <td className="p-4">
                    {attendee.full_name ??
                        "Unnamed User"}
                </td>

                <td className="p-4">
                    {attendee.email}
                </td>

                <td className="p-4">
                    {new Date(
                        attendee.registered_at
                    ).toLocaleString()}
                </td>

                <td className="p-4">
                    {attendee.checked_in ? (
                        <span className="text-green-600 font-medium">
                            Checked In
                        </span>
                    ) : (
                        <span className="text-yellow-600 font-medium">
                            Pending
                        </span>
                    )}
                </td>

                <td className="p-4">
                    {attendee.checked_in ? (
                        <span className="text-sm text-muted-foreground">
                            {attendee.checked_in_at
                                ? new Date(
                                      attendee.checked_in_at
                                  ).toLocaleString()
                                : "-"}
                        </span>
                    ) : (
                        <CheckInButton
                            registrationId={
                                attendee.registration_id
                            }
                        />
                    )}
                </td>
            </tr>
        ))
    )}
</tbody>
                </table>
            </div>
        </div>
    );
}