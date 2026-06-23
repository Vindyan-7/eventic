import { requireUser } from "@/lib/auth";
import { CreateEventForm } from "@/components/forms/create-event-form";

export default async function CreateEventPage() {
    await requireUser("/org/events/create");
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
                <p className="text-muted-foreground">Fill in the details below to publish your event.</p>
            </div>

            <div className="bg-background/80 backdrop-blur-xl border rounded-2xl shadow-sm p-8">
                <CreateEventForm />
            </div>
        </div>
    );
}
