import { notFound } from "next/navigation";
import { requireWorkspacePermission } from "@/lib/workspace-auth";
import { getOrganizationEvent } from "@/services/event-management";
import { EditEventForm } from "@/components/forms/edit-event-form";

interface PageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { eventId } = await params;
  await requireWorkspacePermission("events.edit");

  const result = await getOrganizationEvent(eventId);

  if (result.error || !result.data) {
    notFound();
  }

  const event = result.data;

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans text-xs">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Edit Event</h1>
        <p className="text-neutral-500 font-bold mt-2">
          Update event information, pricing, attendee limits, schedule, banner and publication settings.
        </p>
      </div>

      {/* Event Summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-5">
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Registrations</p>
          <p className="text-3xl font-extrabold text-white mt-2">{event.registration_count}</p>
        </div>

        <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-5">
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Capacity</p>
          <p className="text-3xl font-extrabold text-white mt-2">{event.max_attendees ?? "∞"}</p>
        </div>

        <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-5">
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Status</p>
          <div className="mt-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize border ${
                event.status === "published"
                  ? "bg-emerald-950/20 text-emerald-450 border-emerald-900/40"
                  : event.status === "draft"
                  ? "bg-yellow-950/20 text-yellow-450 border-yellow-900/40"
                  : event.status === "cancelled"
                  ? "bg-red-950/20 text-red-450 border-red-900/40"
                  : "bg-blue-950/20 text-blue-450 border-blue-900/40"
              }`}
            >
              {event.status}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-6 sm:p-8">
        <EditEventForm
          event={{
            id: event.id,
            title: event.title,
            description: event.description,
            venue: event.venue,
            starts_at: event.starts_at,
            ends_at: event.ends_at,
            is_paid: event.is_paid,
            ticket_price: event.ticket_price,
            banner_url: event.banner_url,
            max_attendees: event.max_attendees,
            status: event.status,
            category: event.category,
            custom_questions: event.custom_questions,
          }}
        />
      </div>
    </div>
  );
}