import { notFound } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { DownloadTicketButton } from "@/components/event/download-ticket-button";
import { ShareTicketButton } from "@/components/event/share-ticket-button";

import {
    Calendar,
    MapPin,
    Clock,
    CheckCircle,
    Ticket,
    Building2,
    User,
} from "lucide-react";

import {
    getEventStatus,
    getEventStatusClasses,
} from "@/lib/event-status";

export default async function TicketPage({
    params,
}: {
    params: Promise<{
        registrationId: string;
    }>;
}) {
    const { registrationId } =
        await params;

    await requireUser(`/dashboard/events/${registrationId}`);

    const supabase =
        await createClient();

    const {
        data: registration,
        error,
    } = await supabase
        .from("event_registrations")
        .select(`
            *,
            profiles (
                full_name,
                email
            ),
            events (
                *,
                organizations (
                    name,
                    logo_url
                )
            )
        `)
        .eq("id", registrationId)
        .single();

    if (error || !registration) {
        notFound();
    }

    const event =
        registration.events;

    const qrCode =
        await QRCode.toDataURL(
            registration.id
        );

    const eventStatus =
        getEventStatus(
            event.starts_at,
            event.ends_at,
            event.status
        );

    const startDate =
        new Date(event.starts_at);

    const endDate =
        event.ends_at
            ? new Date(event.ends_at)
            : null;

    const registrationStatus =
        registration.checked_in
            ? "Checked In"
            : eventStatus === "Completed"
                ? "Completed"
                : "Registered";

    return (
        <div className="container mx-auto px-4 py-10">

            <div className="max-w-5xl mx-auto">

                <div className="overflow-hidden rounded-3xl border shadow-sm bg-background">

                    {/* HERO */}

                    <div className="relative h-64 md:h-80">

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

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">

                            <div className="flex flex-wrap gap-2 mb-4">

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${getEventStatusClasses(
                                        eventStatus
                                    )}`}
                                >
                                    {eventStatus}
                                </span>

                                <span className="rounded-full bg-white text-black px-3 py-1 text-xs font-medium">
                                    {event.is_paid
                                        ? `₹${event.ticket_price}`
                                        : "FREE"}
                                </span>

                                {event.category && (
                                    <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs">
                                        {event.category}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold">
                                {event.title}
                            </h1>

                            <div className="flex items-center gap-2 mt-3">

                                {event.organizations
                                    ?.logo_url && (
                                        <Image
                                            src={
                                                event
                                                    .organizations
                                                    .logo_url
                                            }
                                            alt={
                                                event
                                                    .organizations
                                                    .name
                                            }
                                            width={28}
                                            height={28}
                                            className="rounded-full"
                                        />
                                    )}

                                <span className="text-sm text-white/80">
                                    {
                                        event
                                            .organizations
                                            ?.name
                                    }
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* BODY */}

                    <div className="p-6 md:p-8 space-y-8">

                        {/* STATUS */}

                        <div className="flex flex-wrap gap-3">

                            <span
                                className={`rounded-full px-4 py-2 text-sm font-medium ${registration.checked_in
                                        ? "bg-green-100 text-green-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                            >
                                {
                                    registrationStatus
                                }
                            </span>

                            <span className="rounded-full border px-4 py-2 text-sm">
                                Digital Ticket
                            </span>

                        </div>

                        {/* EVENT DETAILS */}

                        <div className="grid gap-4 md:grid-cols-4">

                            <div className="rounded-2xl border p-4">

                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Calendar className="h-4 w-4" />
                                    Date
                                </div>

                                <p className="mt-3 font-semibold">
                                    {startDate.toLocaleDateString(
                                        "en-IN",
                                        {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        }
                                    )}
                                </p>

                            </div>

                            <div className="rounded-2xl border p-4">

                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Clock className="h-4 w-4" />
                                    Time
                                </div>

                                <p className="mt-3 font-semibold">
                                    {startDate.toLocaleTimeString(
                                        "en-IN",
                                        {
                                            hour: "numeric",
                                            minute: "2-digit",
                                        }
                                    )}
                                </p>

                            </div>

                            <div className="rounded-2xl border p-4">

                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <MapPin className="h-4 w-4" />
                                    Venue
                                </div>

                                <p className="mt-3 font-semibold">
                                    {event.venue ||
                                        "Venue TBA"}
                                </p>

                            </div>

                            <div className="rounded-2xl border p-4">

                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Building2 className="h-4 w-4" />
                                    Organizer
                                </div>

                                <p className="mt-3 font-semibold">
                                    {
                                        event
                                            .organizations
                                            ?.name
                                    }
                                </p>

                            </div>

                        </div>

                        {/* ATTENDEE */}

                        {registration.profiles && (
                            <div className="rounded-2xl border p-6">

                                <h2 className="font-semibold text-lg mb-4">
                                    Attendee Information
                                </h2>

                                <div className="flex items-center gap-3">

                                    <User className="h-5 w-5 text-muted-foreground" />

                                    <div>
                                        <p className="font-medium">
                                            {
                                                registration
                                                    .profiles
                                                    .full_name
                                            }
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            {
                                                registration
                                                    .profiles
                                                    .email
                                            }
                                        </p>
                                    </div>

                                </div>

                            </div>
                        )}

                        {/* QR */}

                        <div className="rounded-3xl border border-dashed p-8">

                            <div className="flex flex-col items-center">

                                <div className="flex items-center gap-2 mb-4">

                                    <Ticket className="h-5 w-5" />

                                    <span className="font-semibold">
                                        Event Entry Pass
                                    </span>

                                </div>

                                <img
                                    src={qrCode}
                                    alt="Ticket QR"
                                    className="rounded-2xl border bg-white p-2"
                                />

                                <p className="mt-5 text-sm text-muted-foreground text-center">
                                    Show this QR code at the event entrance.
                                </p>

                            </div>

                        </div>

                        {/* REGISTRATION DETAILS */}

                        <div className="grid gap-4 md:grid-cols-2">

                            <div className="rounded-2xl bg-muted/40 p-4">

                                <p className="text-xs text-muted-foreground">
                                    Registration ID
                                </p>

                                <code className="block mt-2 break-all text-sm">
                                    {registration.id}
                                </code>

                            </div>

                            <div className="rounded-2xl bg-muted/40 p-4">

                                <p className="text-xs text-muted-foreground">
                                    Registered On
                                </p>

                                <p className="mt-2 text-sm font-medium">
                                    {new Date(
                                        registration.created_at
                                    ).toLocaleString()}
                                </p>

                            </div>

                        </div>

                        {/* CHECK IN */}

                        {registration.checked_in && (
                            <div className="rounded-2xl border border-green-500 bg-green-50 p-5">

                                <div className="flex items-center gap-2 text-green-700">

                                    <CheckCircle className="h-5 w-5" />

                                    <span className="font-semibold">
                                        Successfully Checked In
                                    </span>

                                </div>

                            </div>
                        )}

                        {/* Ticket Actions */}
                        <div className="flex flex-wrap gap-4 justify-center border-t pt-6 mt-6">
                            <DownloadTicketButton
                                registrationId={registration.id}
                                eventName={event.title}
                                orgName={event.organizations?.name || "Organizer"}
                                venue={event.venue || "Venue TBA"}
                                startDate={event.starts_at}
                                endDate={event.ends_at}
                                attendeeName={registration.profiles?.full_name || "Guest"}
                                qrCode={qrCode}
                                bannerUrl={event.banner_url || ""}
                                eventStatus={eventStatus}
                            />
                            <ShareTicketButton
                                registrationId={registration.id}
                                eventName={event.title}
                            />
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}