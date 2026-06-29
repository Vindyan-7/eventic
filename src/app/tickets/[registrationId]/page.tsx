import { notFound } from "next/navigation";
import { getTicket } from "@/services/tickets";
import QRCode from "qrcode";
import Image from "next/image";
import { DownloadTicketButton } from "@/components/event/download-ticket-button";
import { ShareTicketButton } from "@/components/event/share-ticket-button";
import { getEventStatus } from "@/lib/event-status";

import { requireUser } from "@/lib/auth";

interface Props {
    params: Promise<{
        registrationId: string;
    }>;
}

export default async function TicketPage({
    params,
}: Props) {
    const { registrationId } =
        await params;

    await requireUser(`/tickets/${registrationId}`);

    const ticket =
        await getTicket(
            registrationId
        );

    if (!ticket) {
        notFound();
    }

    const qrCode =
        await QRCode.toDataURL(
            registrationId
        );

    const event =
        Array.isArray(ticket.events)
            ? ticket.events[0]
            : ticket.events;

    const profile =
        Array.isArray(ticket.profiles)
            ? ticket.profiles[0]
            : ticket.profiles;

    const organization =
        Array.isArray(event?.organizations)
            ? event.organizations[0]
            : event?.organizations;


    return (
        <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border bg-background shadow-lg">

                {/* Banner */}
                <div className="relative h-52 sm:h-72">
                    <Image
                        src={
                            event.banner_url ||
                            "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1600"
                        }
                        alt={event.title}
                        fill
                        priority
                        className="object-cover"
                    />

                    <div className="absolute inset-0 bg-black/40" />

                    <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-sm opacity-90">
                            {
                                organization?.name
                            }
                        </p>


                        <h1 className="text-3xl sm:text-4xl font-bold mt-1">
                            {event.title}
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-8">

                    {/* Status */}
                    <div className="flex flex-wrap gap-3">
                        <span className="rounded-full bg-green-100 text-green-700 px-4 py-1 text-sm font-medium">
                            Registered
                        </span>

                        {ticket.checked_in ? (
                            <span className="rounded-full bg-blue-100 text-blue-700 px-4 py-1 text-sm font-medium">
                                Checked In
                            </span>
                        ) : (
                            <span className="rounded-full bg-yellow-100 text-yellow-700 px-4 py-1 text-sm font-medium">
                                Not Checked In
                            </span>
                        )}
                    </div>

                    {/* Information */}
                    <div className="grid gap-6 md:grid-cols-2">

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Attendee
                            </p>

                            <p className="font-semibold text-lg">
                                {
                                    profile?.full_name
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Email
                            </p>

                            <p className="font-semibold break-all">
                                {
                                    profile?.email
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Venue
                            </p>

                            <p className="font-semibold">
                                {event.venue}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Registration Date
                            </p>

                            <p className="font-semibold">
                                {new Date(
                                    ticket.created_at
                                ).toLocaleDateString()}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Starts
                            </p>

                            <p className="font-semibold">
                                {new Date(
                                    event.starts_at
                                ).toLocaleString()}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Ends
                            </p>

                            <p className="font-semibold">
                                {event.ends_at
                                    ? new Date(
                                        event.ends_at
                                    ).toLocaleString()
                                    : "Not specified"}
                            </p>
                        </div>

                    </div>

                    {/* QR Section */}
                    <div className="border rounded-3xl p-6 sm:p-8 flex flex-col items-center bg-muted/20">

                        <Image
                            src={qrCode}
                            alt="QR Code"
                            width={260}
                            height={260}
                            className="rounded-xl"
                        />

                        <h2 className="mt-6 text-lg font-semibold">
                            Event Entry QR Code
                        </h2>

                        <p className="text-sm text-muted-foreground text-center mt-2">
                            Present this QR code at the event entrance.
                        </p>

                        <div className="mt-6 w-full max-w-lg rounded-xl border bg-background p-4">
                            <p className="text-xs text-muted-foreground">
                                Ticket Number
                            </p>

                            <p className="font-mono text-xs sm:text-sm break-all mt-1 font-bold">
                                {ticket.ticket_number}
                            </p>
                        </div>
                    </div>

                    {/* Ticket Actions */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        <DownloadTicketButton
                            registrationId={registrationId}
                            ticketNumber={ticket.ticket_number}
                            eventName={event.title}
                            orgName={organization?.name || "Organizer"}
                            venue={event.venue || "Venue TBA"}
                            startDate={event.starts_at}
                            endDate={event.ends_at}
                            attendeeName={profile?.full_name || "Guest"}
                            qrCode={qrCode}
                            bannerUrl={event.banner_url || ""}
                            eventStatus={getEventStatus(event.starts_at, event.ends_at, event.status)}
                        />

                        <ShareTicketButton
                            registrationId={registrationId}
                            eventName={event.title}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}