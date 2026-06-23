import { getPublishedEvents } from "@/services/public-events";
import { EventsFilter } from "@/components/event/events-filters";

export default async function EventsPage() {
    const events = await getPublishedEvents();

    const sortedEvents = [...events].sort((a: any, b: any) => {
        // We keep the initial sort if needed, but since it's a client component, 
        // the client will handle its own sorting if we want, 
        // but let's pass a reasonably sorted list as initial.
        return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    });

    return (
        <div className="container mx-auto px-4 py-8 lg:py-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background to-muted/40 p-6 lg:p-10 mb-10">
                <div className="max-w-3xl">
                    <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                        Discover Amazing Events
                    </h1>

                    <p className="text-muted-foreground mt-4 text-base lg:text-lg">
                        Explore workshops, hackathons, conferences, meetups and community events happening around you.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="rounded-full border px-4 py-2 text-sm bg-background/50 backdrop-blur-sm">
                            {events.length} Events Available
                        </div>
                    </div>
                </div>
            </div>

            <EventsFilter events={sortedEvents} />

            {/* Results Header */}
            {/* Note: The header and grid are now inside EventsFilter to support live filtering */}
        </div>
    );
}