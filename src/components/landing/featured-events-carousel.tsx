"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getEventStatus, getEventStatusClasses } from "@/lib/event-status";
import { Calendar, MapPin, Users, Building2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface FeaturedEventsCarouselProps {
    events: any[];
}

function formatEventDate(dateStr: string) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

export function FeaturedEventsCarousel({ events }: FeaturedEventsCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

    // Filter events
    const upcomingEvents = events.filter((event) => {
        const status = getEventStatus(event.starts_at, event.ends_at, event.status);
        return status === "Upcoming" || status === "Live";
    }).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    const pastEvents = events.filter((event) => {
        const status = getEventStatus(event.starts_at, event.ends_at, event.status);
        return status === "Completed";
    }).sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

    const activeEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

    const scroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const scrollAmount = 320;
        container.scrollTo({
            left: direction === "left" 
                ? container.scrollLeft - scrollAmount 
                : container.scrollLeft + scrollAmount,
            behavior: "smooth"
        });
    };

    return (
        <section className="container mx-auto px-6 py-24 space-y-10 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm uppercase tracking-wider">
                        <Sparkles className="h-4 w-4" />
                        <span>Curated Happenings</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        Featured Events
                    </h2>
                </div>

                {/* Filter Tabs & Scroll Controls */}
                <div className="flex items-center gap-4">
                    <div className="bg-muted p-1 rounded-2xl flex items-center border">
                        <button
                            onClick={() => setActiveTab("upcoming")}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                activeTab === "upcoming"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Upcoming & Live ({upcomingEvents.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("past")}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                activeTab === "past"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Completed ({pastEvents.length})
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll("left")}
                            className="rounded-xl h-10 w-10 border-border/80 bg-background cursor-pointer"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll("right")}
                            className="rounded-xl h-10 w-10 border-border/80 bg-background cursor-pointer"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {activeEvents.length === 0 ? (
                <div className="border border-dashed rounded-[2rem] p-16 text-center bg-muted/10">
                    <p className="text-muted-foreground text-sm font-semibold">
                        No events found in this category. Stay tuned!
                    </p>
                </div>
            ) : (
                /* Carousel viewport */
                <div className="relative">
                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-6 snap-x snap-mandatory scroll-smooth scrollbar-none pb-6 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        {activeEvents.map((event: any) => {
                            const status = getEventStatus(event.starts_at, event.ends_at, event.status);
                            const regCount = event.event_registrations?.length ?? 0;
                            const occupancy = event.max_attendees
                                ? Math.round((regCount / event.max_attendees) * 100)
                                : null;

                            return (
                                <div
                                    key={event.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border bg-card hover:bg-card/85 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 w-[310px] md:w-[360px] shrink-0 snap-start"
                                >
                                    {/* Main Card Link Overlay */}
                                    <Link href={`/events/${event.slug}`} className="absolute inset-0 z-0" aria-label={event.title} />

                                    {/* Direct Banner Rendering */}
                                    <div className="relative h-48 md:h-52 w-full overflow-hidden border-b pointer-events-none">
                                        <Image
                                            src={event.banner_url || "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1200"}
                                            alt={event.title}
                                            fill
                                            priority={events.slice(0, 3).some(e => e.id === event.id)}
                                            sizes="(max-w-768px) 310px, 360px"
                                            className="object-cover transition-transform duration-500 group-hover:scale-103"
                                        />
                                        <div className="absolute left-4 top-4 flex gap-2">
                                            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${getEventStatusClasses(status)}`}>
                                                {status}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${event.is_paid ? "bg-blue-600 text-white" : "bg-white text-black border border-border/20"}`}>
                                                {event.is_paid ? `₹${event.ticket_price}` : "Free"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-4 flex-grow flex flex-col justify-between relative z-10 pointer-events-none">
                                        <div className="space-y-3 pointer-events-auto">
                                            <Link
                                                href={`/organizations/${event.organizations?.slug}`}
                                                className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                                            >
                                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground line-clamp-1">
                                                    {event.organizations?.name}
                                                </span>
                                            </Link>

                                            <h3 className="font-extrabold text-xl line-clamp-2 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                {event.title}
                                            </h3>
                                        </div>

                                        <div className="space-y-2.5 text-xs text-muted-foreground border-t pt-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 shrink-0 text-violet-500/80" />
                                                <span>{formatEventDate(event.starts_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 shrink-0 text-violet-500/80" />
                                                <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 shrink-0 text-violet-500/80" />
                                                <span>
                                                    {regCount} / {event.max_attendees || "∞"} Registered
                                                    {occupancy !== null && <span className="ml-1.5 font-bold text-violet-600 dark:text-violet-400">({occupancy}% Full)</span>}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="text-center pt-4">
                <Button asChild size="lg" variant="outline" className="rounded-2xl px-8 font-extrabold border-border/80 bg-background cursor-pointer">
                    <Link href="/events">Explore More Events</Link>
                </Button>
            </div>
        </section>
    );
}
