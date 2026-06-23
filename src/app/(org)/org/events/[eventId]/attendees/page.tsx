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
    const { eventId } = await params;
    await requireOrgAdmin(`/org/events/${eventId}/attendees`);

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

    const checkedInCount = attendees.filter(
        (attendee) => attendee.checked_in
    ).length;

    const pendingCount =
        attendees.length - checkedInCount;

    const attendanceRate =
        attendees.length === 0
            ? 0
            : Math.round(
                (checkedInCount /
                    attendees.length) *
                100
            );

    const capacityPercentage =
        event.max_attendees
            ? Math.round(
                (attendees.length /
                    event.max_attendees) *
                100
            )
            : null;

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

            {/* Stats */}

            <div className="grid gap-4 md:grid-cols-4">

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Total Attendees
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {attendees.length}
                    </p>
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Checked In
                    </p>

                    <p className="text-3xl font-bold mt-2 text-green-600">
                        {checkedInCount}
                    </p>
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Pending
                    </p>

                    <p className="text-3xl font-bold mt-2 text-yellow-600">
                        {pendingCount}
                    </p>
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Attendance
                    </p>

                    <p className="text-3xl font-bold mt-2 text-blue-600">
                        {attendanceRate}%
                    </p>
                </div>

            </div>

            {/* Capacity */}

            {event.max_attendees && (
                <div className="rounded-2xl border p-6">

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold">
                            Capacity
                        </h2>

                        <span className="text-sm text-muted-foreground">
                            {attendees.length}
                            {" / "}
                            {event.max_attendees}
                        </span>
                    </div>

                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full bg-primary"
                            style={{
                                width: `${capacityPercentage}%`,
                            }}
                        />
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                        {capacityPercentage}% filled
                    </p>

                </div>
            )}

            {/* Attendee List */}

            {attendees.length === 0 ? (
                <div className="rounded-2xl border p-12 text-center">

                    <h2 className="text-xl font-semibold">
                        No Attendees Yet
                    </h2>

                    <p className="text-muted-foreground mt-2">
                        Share your event link to start receiving registrations.
                    </p>

                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4 px-1">

                        <h2 className="text-xl font-semibold">
                            Attendee List
                        </h2>

                        <span className="text-sm text-muted-foreground">
                            {attendees.length} registrations
                        </span>

                    </div>

                    <div className="rounded-2xl border overflow-hidden">

                        <div className="overflow-x-auto">

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
                                            Registered
                                        </th>

                                        <th className="text-left p-4">
                                            Check-In
                                        </th>

                                        <th className="text-left p-4">
                                            Payment
                                        </th>

                                        <th className="text-left p-4">
                                            Action
                                        </th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {attendees.map(
                                        (attendee) => (
                                            <tr
                                                key={
                                                    attendee.registration_id
                                                }
                                                className="border-t"
                                            >
                                                <td className="p-4 font-medium">
                                                    {attendee.full_name ??
                                                        "Unnamed User"}
                                                </td>

                                                <td className="p-4">
                                                    {attendee.email}
                                                </td>

                                                <td className="p-4 text-sm">
                                                    {new Date(
                                                        attendee.registered_at
                                                    ).toLocaleDateString()}
                                                </td>

                                                <td className="p-4">

                                                    {attendee.checked_in ? (
                                                        <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
                                                            Checked In
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-medium">
                                                            Pending
                                                        </span>
                                                    )}

                                                </td>

                                                <td className="p-4">

                                                    {attendee.payment_status === "paid" ? (
                                                        <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-medium">
                                                            Paid
                                                        </span>
                                                    ) : attendee.payment_status === "pending" ? (
                                                        <span className="rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-medium">
                                                            Pending
                                                        </span>
                                                    ) : attendee.payment_status === "failed" ? (
                                                        <span className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-medium">
                                                            Failed
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium">
                                                            Free
                                                        </span>
                                                    )}

                                                </td>

                                                <td className="p-4">

                                                    {attendee.checked_in ? (
                                                        <span className="text-xs text-muted-foreground">
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
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>
                </>
            )}

        </div>
    );
}