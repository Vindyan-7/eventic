"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Calendar,
    MapPin,
    Users,
    ArrowRight,
    Building2
} from "lucide-react";
import {
    getEventStatus,
    getEventStatusClasses,
} from "@/lib/event-status";

interface EventsFilterProps {
    events: any[];
}

export function EventsFilter({
    events,
}: EventsFilterProps) {
    const [search, setSearch] =
        useState("");

    const [priceFilter, setPriceFilter] =
        useState("all");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [organizerFilter, setOrganizerFilter] =
        useState("all");

    const organizers = Array.from(
        new Set(
            events
                .map(
                    (event: any) =>
                        event.organizations?.name
                )
                .filter(Boolean)
        )
    ) as string[];

    const filteredEvents =
        useMemo(() => {
            return events.filter(
                (event: any) => {
                    const status = getEventStatus(
                        event.starts_at,
                        event.ends_at,
                        event.status
                    );

                    const matchesSearch =
                        event.title
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        event.description
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            );

                    const matchesOrganizer =
                        organizerFilter === "all" ||
                        event.organizations?.name ===
                        organizerFilter;

                    const matchesPrice =
                        priceFilter ===
                        "all" ||
                        (priceFilter ===
                            "free" &&
                            !event.is_paid) ||
                        (priceFilter ===
                            "paid" &&
                            event.is_paid);

                    let matchesStatus = true;

                    if (statusFilter === "upcoming") {
                        matchesStatus = status === "Upcoming";
                    }

                    if (statusFilter === "live") {
                        matchesStatus = status === "Live";
                    }

                    if (statusFilter === "completed") {
                        matchesStatus = status === "Completed";
                    }

                    return (
                        matchesSearch &&
                        matchesPrice &&
                        matchesStatus &&
                        matchesOrganizer
                    );
                }
            );
        }, [
            events,
            search,
            priceFilter,
            statusFilter,
            organizerFilter,
        ]);

    return (
        <div className="space-y-8">

            {/* Search */}

            <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) =>
                    setSearch(
                        e.target.value
                    )
                }
                className="w-full rounded-xl border p-4 shadow-sm focus:ring-2 focus:ring-primary outline-none"
            />

            {/* Status Tabs */}

            <div className="flex flex-wrap gap-2">

                {[
                    "all",
                    "upcoming",
                    "live",
                    "completed",
                ].map((tab) => (
                    <button
                        key={tab}
                        onClick={() =>
                            setStatusFilter(
                                tab
                            )
                        }
                        className={`rounded-full px-4 py-2 text-sm border transition ${statusFilter ===
                            tab
                            ? "bg-black text-white"
                            : "hover:bg-muted"
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}

            </div>

            {/* Organizer Filter UI */}

            <div className="flex flex-wrap gap-2">

                <button
                    onClick={() =>
                        setOrganizerFilter("all")
                    }
                    className={`rounded-full border px-4 py-2 text-sm transition ${organizerFilter === "all"
                        ? "bg-black text-white"
                        : "hover:bg-muted"
                        }`}
                >
                    All Organizers
                </button>

                {organizers.map(
                    (organizer) => (
                        <button
                            key={organizer}
                            onClick={() =>
                                setOrganizerFilter(
                                    organizer
                                )
                            }
                            className={`rounded-full border px-4 py-2 text-sm transition ${organizerFilter === organizer
                                ? "bg-black text-white"
                                : "hover:bg-muted"
                                }`}
                        >
                            {organizer}
                        </button>
                    )
                )}
            </div>

            {/* Price Filter */}

            <div className="flex gap-3">

                {["all", "free", "paid"].map((p) => {
                    const isComingSoon = p === "paid";
                    return (
                        <button
                            key={p}
                            disabled={isComingSoon}
                            onClick={() => setPriceFilter(p)}
                            className={`rounded-lg border px-4 py-2 text-sm transition ${
                                priceFilter === p
                                    ? "bg-black text-white"
                                    : isComingSoon
                                    ? "opacity-50 cursor-not-allowed text-muted-foreground bg-muted/25"
                                    : "hover:bg-muted"
                            }`}
                        >
                            {isComingSoon ? "Paid (Coming Soon)" : p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    );
                })}

            </div>

            {/* Result Count */}

            <p className="text-sm text-muted-foreground">
                Showing
                {" "}
                {filteredEvents.length}
                {" "}
                of
                {" "}
                {events.length}
                {" "}
                events
            </p>

            {/* Grid */}
            {filteredEvents.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-16 text-center bg-muted/5">
                    <h2 className="text-xl font-semibold">No events found</h2>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event: any) => {
                        const status = getEventStatus(
                            event.starts_at,
                            event.ends_at,
                            event.status
                        );
                        const registrationCount = event.event_registrations?.length ?? 0;
                        const occupancy = event.max_attendees
                            ? Math.round((registrationCount / event.max_attendees) * 100)
                            : null;

                        return (
                            <Link
                                key={event.id}
                                href={`/events/${event.slug}`}
                                className="group overflow-hidden rounded-3xl border bg-background transition-all hover:shadow-xl"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <Image
                                        src={event.banner_url || "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1200"}
                                        alt={event.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute left-4 top-4 flex gap-2">
                                        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${getEventStatusClasses(status)}`}>
                                            {status}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${event.is_paid ? "bg-blue-600 text-white" : "bg-white text-black"}`}>
                                            {event.is_paid ? `₹${event.ticket_price}` : "Free"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            {event.organizations?.name}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg line-clamp-2 leading-tight">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-2 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(event.starts_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3" />
                                            <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3 w-3" />
                                            <span>
                                                {registrationCount} / {event.max_attendees || "∞"} Registered
                                                {occupancy !== null && <span className="ml-2 font-bold text-primary">({occupancy}% Full)</span>}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-4">
                                        <span className="text-sm font-semibold">View Details</span>
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
