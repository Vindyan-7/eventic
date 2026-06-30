import { requireWorkspacePermission } from "@/lib/workspace-auth";
import { CreateEventForm } from "@/components/forms/create-event-form";

export default async function CreateEventPage() {
  await requireWorkspacePermission("events.create");

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans text-xs">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Create New Event</h1>
        <p className="text-neutral-500 font-bold mt-1">Fill in the details below to publish your event.</p>
      </div>

      <div className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-8">
        <CreateEventForm />
      </div>
    </div>
  );
}
