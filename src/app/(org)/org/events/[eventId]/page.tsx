import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOrgAdmin } from "@/lib/org-auth";
import { getOrganizationEvent } from "@/services/event-management";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteEventButton } from "@/components/event/delete-event-button";


// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

// ─── page ─────────────────────────────────────────────────────────────────────

interface PageProps {
    params: Promise<{ eventId: string }>;
}

export default async function OrgEventDetailPage({ params }: PageProps) {
    const { eventId } = await params;
    await requireOrgAdmin(`/org/events/${eventId}`);
    const result = await getOrganizationEvent(eventId);

    if (result.error || !result.data) {
        notFound();
    }

    const event = result.data;

    const registrationPercentage =
        event.max_attendees
            ? Math.round(
                (event.registration_count /
                    event.max_attendees) *
                100
            )
            : null;

    const revenue =
        event.is_paid
            ? event.registration_count *
            Number(event.ticket_price)
            : 0;

    const now = new Date();

    const autoStatus =
        event.status === "cancelled"
            ? "cancelled"
            : event.ends_at &&
                new Date(event.ends_at) < now
                ? "completed"
                : new Date(event.starts_at) < now
                    ? "live"
                    : "upcoming";

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* ── Page header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">
                        Event Management
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight">
                        {event.title}
                    </h1>
                </div>

                {/* Status badge */}
                <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize mt-2 ${STATUS_STYLES[event.status] ?? ""}`}
                >
                    {event.status}
                </span>
            </div>

            {event.banner_url && (
                <div className="relative w-full h-64 rounded-2xl overflow-hidden border">
                    <Image
                        src={event.banner_url}
                        alt={`${event.title} banner`}
                        fill
                        sizes="(max-width: 896px) 100vw, 896px"
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-4">

                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">
                            Registrations
                        </p>

                        <p className="text-3xl font-bold mt-2">
                            {event.registration_count}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">
                            Revenue
                        </p>

                        <p className="text-3xl font-bold mt-2">
                            ₹{revenue}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">
                            Capacity Used
                        </p>

                        <p className="text-3xl font-bold mt-2">
                            {registrationPercentage ??
                                "∞"}
                            %
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">
                            Status
                        </p>

                        <p className="text-3xl font-bold mt-2 capitalize">
                            {autoStatus}
                        </p>
                    </CardContent>
                </Card>

            </div>

            {/* ── Details card ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Event Details</CardTitle>
                </CardHeader>

                <CardContent>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                        {/* Venue */}
                        <div>
                            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Venue
                            </dt>
                            <dd className="text-sm font-medium">
                                {event.venue ?? "—"}
                            </dd>
                        </div>

                        {/* Starts At */}
                        <div>
                            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Starts At
                            </dt>
                            <dd className="text-sm font-medium">
                                {formatDate(event.starts_at)}
                            </dd>
                        </div>

                        {/* Ends At */}
                        {event.ends_at && (
                            <div>
                                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Ends At
                                </dt>
                                <dd className="text-sm font-medium">
                                    {formatDate(event.ends_at)}
                                </dd>
                            </div>
                        )}

                        {/* Ticket price */}
                        <div>
                            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Ticket Price
                            </dt>
                            <dd className="text-sm font-medium">
                                {event.is_paid
                                    ? `₹${event.ticket_price.toFixed(2)}`
                                    : "Free"}
                            </dd>
                        </div>

                        {/* Max attendees */}
                        {event.max_attendees !== null && (
                            <div>
                                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Capacity
                                </dt>
                                <dd className="text-sm font-medium">
                                    {event.max_attendees} seats
                                </dd>
                            </div>
                        )}

                        <div>
                            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Registrations
                            </dt>
                            <dd className="text-sm font-semibold text-primary">
                                {event.registration_count}
                                {event.max_attendees !== null && (
                                    <span className="text-muted-foreground font-normal">
                                        {" "}/ {event.max_attendees}
                                    </span>
                                )}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                Revenue Generated
                            </dt>

                            <dd className="text-sm font-semibold">
                                ₹{revenue}
                            </dd>
                        </div>

                        {event.max_attendees && (
                            <div className="sm:col-span-2">

                                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                    Capacity Usage
                                </dt>

                                <div className="h-3 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{
                                            width: `${registrationPercentage}%`,
                                        }}
                                    />
                                </div>

                                <p className="mt-2 text-xs text-muted-foreground">
                                    {event.registration_count}
                                    {" / "}
                                    {event.max_attendees}
                                    {" seats filled"}
                                </p>

                            </div>
                        )}
                    </dl>
                </CardContent>

                <CardFooter className="gap-3 flex-wrap">
                    {/* View Attendees */}
                    <Link
                        href={`/org/events/${event.id}/attendees`}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                    >
                        View Attendees
                    </Link>

                    <Link
                        href={`/org/events/${event.id}/scan`}
                        className="rounded-xl bg-black px-4 py-2 text-white"
                    >
                        Scan Tickets
                    </Link>

                    <Link
                        href={`/org/events/${event.id}/waitlist`}
                        className="inline-flex items-center gap-2 rounded-xl border border-orange-600/30 bg-orange-600/10 text-orange-500 px-5 py-2.5 text-sm font-medium hover:bg-orange-600/20 transition-colors"
                    >
                        Manage Waitlist
                    </Link>

                    {/* Edit Event */}
                    <Link
                        href={`/org/events/${event.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-xl border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        Edit Event
                    </Link>

                    {/* View Public Page */}
                    <Link
                        href={`/events/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        View Public Page ↗
                    </Link>

                    <DeleteEventButton eventId={event.id} />

                </CardFooter>
            </Card>

            <Card>

                <CardHeader>
                    <CardTitle>
                        Event Timeline
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    <div>
                        <p className="font-medium">
                            Created
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {formatDate(
                                event.created_at
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="font-medium">
                            Starts
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {formatDate(
                                event.starts_at
                            )}
                        </p>
                    </div>

                    {event.ends_at && (
                        <div>
                            <p className="font-medium">
                                Ends
                            </p>

                            <p className="text-sm text-muted-foreground">
                                {formatDate(
                                    event.ends_at
                                )}
                            </p>
                        </div>
                    )}

                </CardContent>

            </Card>
        </div>
    );
}
