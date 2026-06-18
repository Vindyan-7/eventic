import Link from "next/link";
import { getPublishedEvents } from "@/services/public-events";
import Image from "next/image";
export default async function EventsPage() {
    const events = await getPublishedEvents();

    return (
        <div className="container mx-auto py-10">
            <div className="mb-10">
                <h1 className="text-4xl font-bold">
                    Discover Events
                </h1>

                <p className="text-muted-foreground mt-2">
                    Explore upcoming events happening now.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="group rounded-2xl border p-4 hover:shadow-lg transition bg-white"
                    >
                        <div className="space-y-4">
                            <div className="relative h-48 overflow-hidden rounded-xl">
                                <Image
                                    src={
                                        event.banner_url ||
                                        "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1200&auto=format&fit=crop"
                                    }
                                    alt={event.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>

                            <div>
                                <h2 className="text-2xl font-semibold">
                                    {event.title}
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    {event.organizations?.name}
                                </p>
                            </div>

                            <p className="line-clamp-3 text-sm">
                                {event.description}
                            </p>

                            <div className="flex items-center justify-between text-sm">
                                <span>{event.venue}</span>

                                <span>
                                    {event.is_paid
                                        ? `₹${event.ticket_price}`
                                        : "Free"}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}