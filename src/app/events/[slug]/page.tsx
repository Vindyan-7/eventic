import { notFound } from "next/navigation";
import { getEventBySlug } from "@/services/public-events";
import { RegisterButton } from "@/components/event/register-button";
import Image from "next/image";
import { isRegistered } from "@/services/registration-status";
interface Props {
    params: Promise<{
        slug: string;
    }>;
}

export default async function EventPage({
    params,
}: Props) {
    const { slug } = await params;

    const event = await getEventBySlug(slug);
    const registered = await isRegistered(event.id);
    if (!event) {  
        notFound();
    }

    return (
        <div className="container mx-auto py-10">
            <div className="max-w-4xl">
                <div className="relative mb-8 h-[400px] overflow-hidden rounded-3xl">
                    <Image
                        src={
                            event.banner_url ||
                            "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1600&auto=format&fit=crop"
                        }
                        alt={event.title}
                        fill
                        priority
                        className="object-cover"
                    />

                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {event.organizations?.name}
                        </p>

                        <h1 className="text-5xl font-bold mt-2">
                            {event.title}
                        </h1>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{event.venue}</span>

                        <span>
                            {new Date(
                                event.starts_at
                            ).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="rounded-2xl border p-6">
                        <p className="leading-7">
                            {event.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Ticket
                            </p>

                            <p className="text-2xl font-bold">
                                {event.is_paid
                                    ? `₹${event.ticket_price}`
                                    : "Free"}
                            </p>
                        </div>

                        <RegisterButton
                            eventId={event.id}
                            isPaid={event.is_paid}
                            ticketPrice={event.ticket_price}
                            isRegistered={registered}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}