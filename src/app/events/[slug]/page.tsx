import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Calendar } from "lucide-react";
import { MapPin } from "lucide-react";
import { Users } from "lucide-react";
import { Clock } from "lucide-react";

import { getEventBySlug } from "@/services/public-events";
import { isRegistered } from "@/services/registration-status";
import { getEventCapacity } from "@/services/event-capacity";

import { RegisterButton } from "@/components/event/register-button";
import { createClient } from "@/lib/supabase/server";
import { ShareEventButton } from "@/components/event/share-event-button";

import {
    getEventStatus,
    getEventStatusClasses,
} from "@/lib/event-status";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

export default async function EventPage({
    params,
}: Props) {
    const { slug } = await params;

    const event =
        await getEventBySlug(slug);

    if (!event) {
        notFound();
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    const isAuthenticated = !!user;

    const [
        registrationId,
        capacity,
    ] = await Promise.all([
        isRegistered(event.id),
        getEventCapacity(event.id),
    ]);

    const registered = !!registrationId;

    const status =
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

    return (
        <div className="container mx-auto px-4 py-10">

            <div className="max-w-6xl mx-auto">

                {/* Banner */}

                <div className="relative h-[300px] md:h-[450px] overflow-hidden rounded-3xl">

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

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6">

                        <div className="flex flex-wrap gap-3 mb-4">

                            <span
                                className={`rounded-full px-4 py-2 text-sm font-medium ${getEventStatusClasses(
                                    status
                                )}`}
                            >
                                {status}
                            </span>

                            <span
                                className={`rounded-full px-4 py-2 text-sm font-medium ${event.is_paid
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-black"
                                    }`}
                            >
                                {event.is_paid
                                    ? `₹${event.ticket_price}`
                                    : "Free"}
                            </span>

                            {event.category && (
                                <span className="rounded-full bg-black/40 backdrop-blur text-white px-4 py-2 text-sm">
                                    {event.category}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white">
                            {event.title}
                        </h1>

                        <p className="text-white/80 mt-2">
                            {event.organizations ? (
                                <Link
                                    href={`/organizations/${event.organizations.slug}`}
                                    className="hover:underline hover:text-white transition-colors font-medium"
                                >
                                    {event.organizations.name}
                                </Link>
                            ) : null}
                        </p>
                    </div>
                </div>

                {/* Content */}

                <div className="grid gap-8 lg:grid-cols-3 mt-8">

                    {/* Left */}

                    <div className="lg:col-span-2 space-y-8">

                        <div className="rounded-3xl border p-6">
                            <h2 className="text-2xl font-bold mb-4">
                                About Event
                            </h2>

                            <p className="leading-8 text-muted-foreground whitespace-pre-wrap">
                                {event.description ||
                                    "No description available."}
                            </p>
                        </div>

                        <div className="rounded-3xl border p-6">
                            <h2 className="text-2xl font-bold mb-4">
                                Event Information
                            </h2>

                            <div className="grid gap-5 md:grid-cols-2">

                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Date
                                        </p>

                                        <p>
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
                                </div>

                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Time
                                        </p>

                                        <p>
                                            {startDate.toLocaleTimeString(
                                                "en-IN",
                                                {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                }
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Venue
                                        </p>

                                        <p>
                                            {event.venue ||
                                                "Venue TBA"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Capacity
                                        </p>

                                        <p>
                                            {capacity.maxAttendees
                                                ? `${capacity.currentRegistrations}/${capacity.maxAttendees}`
                                                : "Unlimited"}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Right */}

                    <div className="space-y-6">

                        <div className="rounded-3xl border p-6 sticky top-24">

                            <div className="mb-6">

                                <p className="text-sm text-muted-foreground">
                                    Ticket Price
                                </p>

                                <h3 className="text-4xl font-bold mt-2">
                                    {event.is_paid
                                        ? `₹${event.ticket_price}`
                                        : "Free"}
                                </h3>
                            </div>

                            {capacity.maxAttendees && (
                                <div className="mb-6">

                                    <div className="flex justify-between text-sm mb-2">
                                        <span>
                                            Seats Filled
                                        </span>

                                        <span>
                                            {
                                                capacity.currentRegistrations
                                            }
                                            /
                                            {
                                                capacity.maxAttendees
                                            }
                                        </span>
                                    </div>

                                    <div className="h-2 rounded-full bg-muted overflow-hidden">

                                        <div
                                            className="h-full bg-primary"
                                            style={{
                                                width: `${(capacity.currentRegistrations /
                                                        capacity.maxAttendees) *
                                                    100
                                                    }%`,
                                            }}
                                        />

                                    </div>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Remaining:{" "}
                                        {
                                            capacity.spotsRemaining
                                        }
                                    </p>

                                </div>
                            )}

                            <RegisterButton
                                eventId={event.id}
                                isPaid={event.is_paid}
                                ticketPrice={Number(
                                    event.ticket_price
                                )}
                                isRegistered={
                                    registered
                                }
                                registrationId={
                                    registrationId
                                }
                                isFull={
                                    capacity.isFull
                                }
                                isEventClosed={
                                    status === "Completed" ||
                                    status === "Cancelled"
                                }
                                eventStatus={status}
                                slug={slug}
                                isAuthenticated={isAuthenticated}
                                customQuestions={event.custom_questions}
                            />

                            <div className="mt-4">
                                <ShareEventButton
                                    title={event.title}
                                    description={event.description || ""}
                                />
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}