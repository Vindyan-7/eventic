import { notFound } from "next/navigation";

import { requireOrgAdmin } from "@/lib/org-auth";
import { getOrganizationEvent } from "@/services/event-management";

import { EditEventForm } from "@/components/forms/edit-event-form";

interface PageProps {
    params: Promise<{
        eventId: string;
    }>;
}

export default async function EditEventPage({
    params,
}: PageProps) {
    const { eventId } = await params;

    await requireOrgAdmin(`/org/events/${eventId}/edit`);

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

    const event = result.data;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                    Edit Event
                </h1>

                <p className="text-muted-foreground mt-2">
                    Update event information,
                    pricing, attendee limits,
                    schedule, banner and
                    publication settings.
                </p>
            </div>

            {/* Event Summary */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="rounded-2xl border p-5">
                    <p className="text-sm text-muted-foreground">
                        Registrations
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {event.registration_count}
                    </p>
                </div>

                <div className="rounded-2xl border p-5">
                    <p className="text-sm text-muted-foreground">
                        Capacity
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {event.max_attendees ??
                            "∞"}
                    </p>
                </div>

                <div className="rounded-2xl border p-5">
                    <p className="text-sm text-muted-foreground">
                        Status
                    </p>

                    <div className="mt-3">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${event.status ===
                                    "published"
                                    ? "bg-green-100 text-green-700"
                                    : event.status ===
                                        "draft"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : event.status ===
                                            "cancelled"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-blue-100 text-blue-700"
                                }`}
                        >
                            {event.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border p-6 sm:p-8">
                <EditEventForm
                    event={{
                        id: event.id,
                        title: event.title,
                        description:
                            event.description,
                        venue: event.venue,
                        starts_at:
                            event.starts_at,
                        ends_at:
                            event.ends_at,
                        is_paid:
                            event.is_paid,
                        ticket_price:
                            event.ticket_price,
                        banner_url:
                            event.banner_url,
                        max_attendees:
                            event.max_attendees,
                        status:
                            event.status,
                        category:
                            event.category,
                    }}

                />
            </div>
        </div>
    );
}