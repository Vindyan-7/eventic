import { notFound } from "next/navigation";
import { requireOrgAdmin } from "@/lib/org-auth";
import { getOrganizationEvent } from "@/services/event-management";
import { getEventWaitlist, getWaitlistAnalytics } from "@/services/waitlist";
import { WaitlistManageClient } from "./waitlist-manage-client";

interface PageProps {
    params: Promise<{ eventId: string }>;
}

export default async function WaitlistManagePage({ params }: PageProps) {
    const { eventId } = await params;
    await requireOrgAdmin(`/org/events/${eventId}/waitlist`);

    const result = await getOrganizationEvent(eventId);
    if (result.error || !result.data) {
        notFound();
    }

    const waitlist = await getEventWaitlist(eventId);
    const analytics = await getWaitlistAnalytics(eventId);

    return (
        <div className="max-w-5xl mx-auto">
            <WaitlistManageClient
                eventId={eventId}
                eventTitle={result.data.title}
                waitlist={waitlist as any}
                analytics={analytics}
            />
        </div>
    );
}
