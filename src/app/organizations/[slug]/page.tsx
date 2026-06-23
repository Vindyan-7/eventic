import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
    Calendar, 
    MapPin, 
    Users, 
    Globe, 
    Clock, 
    CheckCircle, 
    Building2,
    CalendarCheck,
    ArrowUpRight
} from "lucide-react";
import { 
    getOrganizationBySlug, 
    getOrganizationEvents, 
    getOrganizationStats 
} from "@/services/public-organizations";
import { getEventStatus, getEventStatusClasses } from "@/lib/event-status";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function PublicOrganizationPage({ params }: PageProps) {
    const { slug } = await params;

    const organization = await getOrganizationBySlug(slug);
    if (!organization) {
        notFound();
    }

    const [events, stats] = await Promise.all([
        getOrganizationEvents(organization.id),
        getOrganizationStats(organization.id),
    ]);

    // Categorize events
    const upcomingEvents = events.filter((event: any) => {
        const status = getEventStatus(event.starts_at, event.ends_at, event.status);
        return status === "Upcoming" || status === "Live";
    });

    const pastEvents = events.filter((event: any) => {
        const status = getEventStatus(event.starts_at, event.ends_at, event.status);
        return status === "Completed" || status === "Cancelled";
    });

    // Fallback initials for logo
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 space-y-12">
            
            {/* Organization Hero Profile */}
            <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-background to-muted/40 p-6 lg:p-10">
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-[30%] h-[50%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-8 relative z-10">
                    {/* Logo/Avatar */}
                    <div className="relative w-24 h-24 lg:w-32 lg:h-32 shrink-0 border rounded-2xl overflow-hidden bg-muted flex items-center justify-center shadow-lg">
                        {organization.logo_url ? (
                            <Image
                                src={organization.logo_url}
                                alt={organization.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <span className="text-3xl lg:text-5xl font-extrabold text-muted-foreground select-none">
                                {getInitials(organization.name)}
                            </span>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
                                {organization.name}
                            </h1>
                            {organization.description && (
                                <p className="text-muted-foreground text-sm lg:text-base max-w-3xl leading-relaxed">
                                    {organization.description}
                                </p>
                            )}
                        </div>

                        {/* Website link */}
                        {organization.website && (
                            <div>
                                <a
                                    href={organization.website.startsWith("http") ? organization.website : `https://${organization.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted/50 transition-colors shadow-xs"
                                >
                                    <Globe className="h-4 w-4" />
                                    <span>Visit Website</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Events */}
                <div className="rounded-3xl border bg-background/50 backdrop-blur-sm p-6 flex items-center gap-4 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <CalendarCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Events</p>
                        <h4 className="text-2xl font-extrabold mt-1">{stats.totalEvents}</h4>
                    </div>
                </div>

                {/* Total Registrations */}
                <div className="rounded-3xl border bg-background/50 backdrop-blur-sm p-6 flex items-center gap-4 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Registrations</p>
                        <h4 className="text-2xl font-extrabold mt-1">{stats.totalRegistrations}</h4>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="rounded-3xl border bg-background/50 backdrop-blur-sm p-6 flex items-center gap-4 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upcoming Events</p>
                        <h4 className="text-2xl font-extrabold mt-1">{stats.upcomingEvents}</h4>
                    </div>
                </div>

                {/* Completed Events */}
                <div className="rounded-3xl border bg-background/50 backdrop-blur-sm p-6 flex items-center gap-4 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-gray-500/10 flex items-center justify-center text-gray-600 shrink-0">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed Events</p>
                        <h4 className="text-2xl font-extrabold mt-1">{stats.completedEvents}</h4>
                    </div>
                </div>
            </div>

            {/* Empty State: No events at all */}
            {events.length === 0 && (
                <div className="border border-dashed rounded-3xl p-12 text-center bg-muted/10">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No events hosted yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                        This organization hasn't published any public events yet. Check back later for updates.
                    </p>
                </div>
            )}

            {events.length > 0 && (
                <div className="space-y-12">
                    {/* Upcoming Events Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-extrabold tracking-tight">Upcoming Events</h2>
                            <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-bold">
                                {upcomingEvents.length}
                            </span>
                        </div>

                        {upcomingEvents.length === 0 ? (
                            <div className="border border-dashed rounded-2xl p-8 text-center bg-muted/5">
                                <p className="text-muted-foreground text-sm">No upcoming events scheduled right now.</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {upcomingEvents.map((event: any) => {
                                    const eventStatus = getEventStatus(event.starts_at, event.ends_at, event.status);
                                    const regCount = event.event_registrations?.length ?? 0;
                                    const occupancy = event.max_attendees
                                        ? Math.round((regCount / event.max_attendees) * 100)
                                        : null;

                                    return (
                                        <Link
                                            key={event.id}
                                            href={`/events/${event.slug}`}
                                            className="group overflow-hidden rounded-3xl border bg-background transition-all hover:shadow-xl hover:border-primary/20"
                                        >
                                            <div className="relative h-52 overflow-hidden">
                                                <Image
                                                    src={event.banner_url || "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1200"}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                <div className="absolute left-4 top-4 flex gap-2">
                                                    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${getEventStatusClasses(eventStatus)}`}>
                                                        {eventStatus}
                                                    </span>
                                                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${event.is_paid ? "bg-blue-600 text-white" : "bg-white text-black"}`}>
                                                        {event.is_paid ? `₹${event.ticket_price}` : "Free"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <h3 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                    {event.title}
                                                </h3>

                                                <div className="space-y-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>{new Date(event.starts_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-3.5 w-3.5" />
                                                        <span>
                                                            {regCount} / {event.max_attendees || "∞"} Registered
                                                            {occupancy !== null && <span className="ml-2 font-bold text-primary">({occupancy}% Full)</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Past Events Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-2xl font-extrabold tracking-tight text-muted-foreground">Past Events</h2>
                            <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-bold">
                                {pastEvents.length}
                            </span>
                        </div>

                        {pastEvents.length === 0 ? (
                            <div className="border border-dashed rounded-2xl p-8 text-center bg-muted/5">
                                <p className="text-muted-foreground text-sm">No past events recorded.</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 opacity-85 hover:opacity-100 transition-opacity duration-300">
                                {pastEvents.map((event: any) => {
                                    const eventStatus = getEventStatus(event.starts_at, event.ends_at, event.status);
                                    const regCount = event.event_registrations?.length ?? 0;

                                    return (
                                        <Link
                                            key={event.id}
                                            href={`/events/${event.slug}`}
                                            className="group overflow-hidden rounded-3xl border bg-background/60 transition-all hover:shadow-xl hover:border-muted-foreground/20"
                                        >
                                            <div className="relative h-48 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                                                <Image
                                                    src={event.banner_url || "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1200"}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                <div className="absolute left-4 top-4 flex gap-2">
                                                    <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${getEventStatusClasses(eventStatus)}`}>
                                                        {eventStatus}
                                                    </span>
                                                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${event.is_paid ? "bg-blue-600/75 text-white" : "bg-white/75 text-black"}`}>
                                                        {event.is_paid ? `₹${event.ticket_price}` : "Free"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <h3 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors text-muted-foreground group-hover:text-foreground">
                                                    {event.title}
                                                </h3>

                                                <div className="space-y-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span>{new Date(event.starts_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-3.5 w-3.5" />
                                                        <span>{regCount} Attended</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
        </div>
    );
}
