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
    await requireOrgAdmin();

    const { eventId } = await params;

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
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold">
                    Edit Event
                </h1>

                <p className="text-muted-foreground mt-2">
                    Update event information,
                    pricing, schedule and
                    banner.
                </p>
            </div>

            <div className="rounded-2xl border p-6">
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
                    }}
                />
            </div>
        </div>
    );
}