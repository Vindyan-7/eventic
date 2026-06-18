import { requireUser } from "@/lib/auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { EventCard } from "@/components/event/event-card";
import { Calendar, Ticket, Heart, Clock } from "lucide-react";
import { LogoutButton } from "@/components/shared/logout-button";

const MOCK_REGISTERED_EVENTS = [
    {
        id: "1",
        title: "Global Tech Summit 2026",
        date: "Aug 12, 2026",
        location: "San Francisco, CA",
        image: "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=800&auto=format&fit=crop",
        category: "technology",
        attendees: 1200,
        price: "Free",
    },
    {
        id: "2",
        title: "Design Systems Workshop",
        date: "Sept 05, 2026",
        location: "Virtual",
        image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
        category: "design",
        attendees: 450,
        price: 49,
    },
];

export default async function DashboardPage() {
    await requireUser();
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, John! Here's what's happening with your events.</p>
                </div>
                <LogoutButton />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Registrations"
                    value="12"
                    icon={Ticket}
                    trend={{ value: 20, label: "from last month", isPositive: true }}
                />
                <StatsCard
                    title="Upcoming Events"
                    value="3"
                    icon={Calendar}
                />
                <StatsCard
                    title="Saved Events"
                    value="24"
                    icon={Heart}
                />
                <StatsCard
                    title="Hours Attended"
                    value="48"
                    icon={Clock}
                    trend={{ value: 5, label: "from last month", isPositive: true }}
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Registered Events</h2>
                    <button className="text-sm text-primary hover:underline font-medium">View all</button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {MOCK_REGISTERED_EVENTS.map((event) => (
                        <EventCard key={event.id} {...event} />
                    ))}
                </div>
            </div>
        </div>
    );
}
