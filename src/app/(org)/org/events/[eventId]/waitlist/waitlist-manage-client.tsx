"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { promoteWaitlistUser, removeWaitlistUser, skipWaitlistUser } from "@/services/waitlist";
import { CheckCircle, Trash2, SkipForward, Clock, Users, Search, Award, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WaitlistEntry {
    id: string;
    event_id: string;
    position: number;
    status: "waiting" | "reserved" | "claimed" | "expired" | "cancelled" | "skipped";
    reservation_created_at: string | null;
    reservation_expires_at: string | null;
    created_at: string;
    joined_at: string;
    profile: { full_name: string; email: string } | null;
}

interface WaitlistManageClientProps {
    eventId: string;
    eventTitle: string;
    waitlist: WaitlistEntry[];
    analytics: {
        averageWaitMinutes: number;
        totalWaitlisted: number;
        seatsReclaimed: number;
        conversionRate: number;
        missedReservations: number;
    };
}

export function WaitlistManageClient({ eventId, eventTitle, waitlist, analytics }: WaitlistManageClientProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");

    const handlePromote = (id: string) => {
        startTransition(async () => {
            const res = await promoteWaitlistUser(id);
            if (res.error) { toast.error(res.error); return; }
            toast.success("Seat offered to this student. They have 60 minutes to claim it.");
            router.refresh();
        });
    };

    const handleSkip = (id: string) => {
        if (!confirm("Are you sure you want to skip this student? Their seat offer will be cancelled and offered to the next student in queue.")) return;
        startTransition(async () => {
            const res = await skipWaitlistUser(id);
            if (res.error) { toast.error(res.error); return; }
            toast.success("Student skipped. Seat offered to the next student.");
            router.refresh();
        });
    };

    const handleRemove = (id: string) => {
        if (!confirm("Are you sure you want to remove this student from the waitlist?")) return;
        startTransition(async () => {
            const res = await removeWaitlistUser(id);
            if (res.error) { toast.error(res.error); return; }
            toast.success("Removed from waitlist.");
            router.refresh();
        });
    };

    const getStatusBadge = (status: WaitlistEntry["status"]) => {
        switch (status) {
            case "waiting":
                return <span className="rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">In Queue</span>;
            case "reserved":
                return <span className="rounded-full bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider animate-pulse">Seat Reserved</span>;
            case "claimed":
                return <span className="rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Claimed</span>;
            case "expired":
                return <span className="rounded-full bg-neutral-800 text-neutral-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Expired</span>;
            case "cancelled":
                return <span className="rounded-full bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Cancelled</span>;
            case "skipped":
                return <span className="rounded-full bg-neutral-800 text-neutral-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Skipped</span>;
        }
    };

    // Filter list
    const filteredWaitlist = waitlist.filter((entry) => {
        const name = entry.profile?.full_name?.toLowerCase() || "";
        const email = entry.profile?.email?.toLowerCase() || "";
        const q = searchQuery.toLowerCase();
        return name.includes(q) || email.includes(q);
    });

    const activeWaitlist = filteredWaitlist.filter(w => w.status === "waiting" || w.status === "reserved");
    const historyWaitlist = filteredWaitlist.filter(w => w.status === "claimed" || w.status === "expired" || w.status === "cancelled" || w.status === "skipped");

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm text-muted-foreground mb-1">Event Management</p>
                <h1 className="text-3xl font-bold">Waitlist Manager</h1>
                <p className="text-muted-foreground text-sm mt-1">{eventTitle}</p>
            </div>

            {/* Analytics Dashboard Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="rounded-2xl border bg-background p-4 space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Waitlisted</p>
                    <p className="text-2xl font-extrabold">{analytics.totalWaitlisted}</p>
                </div>
                <div className="rounded-2xl border bg-background p-4 space-y-1">
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Seats Reclaimed</p>
                    <p className="text-2xl font-extrabold flex items-center gap-1.5 text-blue-500">
                        <Award className="h-5 w-5" /> {analytics.seatsReclaimed}
                    </p>
                </div>
                <div className="rounded-2xl border bg-background p-4 space-y-1">
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Conversion Rate</p>
                    <p className="text-2xl font-extrabold flex items-center gap-1.5 text-green-500">
                        <TrendingUp className="h-5 w-5" /> {analytics.conversionRate}%
                    </p>
                </div>
                <div className="rounded-2xl border bg-background p-4 space-y-1">
                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">Avg. Wait Time</p>
                    <p className="text-2xl font-extrabold text-yellow-550 flex items-center gap-1.5">
                        <Clock className="h-5 w-5" /> {analytics.averageWaitMinutes}m
                    </p>
                </div>
                <div className="rounded-2xl border bg-background p-4 space-y-1 col-span-2 md:col-span-1">
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Missed Offers</p>
                    <p className="text-2xl font-extrabold text-red-500 flex items-center gap-1.5">
                        <AlertTriangle className="h-5 w-5" /> {analytics.missedReservations}
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search waitlist by student name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl bg-background border h-10 text-xs"
                />
            </div>

            {filteredWaitlist.length === 0 ? (
                <div className="border rounded-3xl p-16 text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">No waitlist entries found</h3>
                        <p className="text-muted-foreground text-sm mt-1">Try adjusting your search criteria or wait for registrations to fill.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Active queue table */}
                    {activeWaitlist.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-extrabold">Active Queue</h2>
                            <div className="rounded-3xl border overflow-hidden bg-background">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/20">
                                            <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">#</th>
                                            <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">Student</th>
                                            <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Joined</th>
                                            <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Offer Expires</th>
                                            <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                                            <th className="text-right p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeWaitlist.map((entry) => {
                                            const isActive = entry.status === "waiting" || entry.status === "reserved";
                                            return (
                                                <tr
                                                    key={entry.id}
                                                    className={`border-b last:border-0 transition-colors ${
                                                        entry.status === "reserved" ? "bg-green-500/5" : "hover:bg-muted/30"
                                                    }`}
                                                >
                                                    <td className="p-4 font-extrabold text-muted-foreground">#{entry.position}</td>
                                                    <td className="p-4">
                                                        <div>
                                                            <p className="font-bold text-xs">{entry.profile?.full_name || "Unknown"}</p>
                                                            <p className="text-[10px] text-muted-foreground">{entry.profile?.email || ""}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground text-xs hidden sm:table-cell">
                                                        {new Date(entry.joined_at || entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                    </td>
                                                    <td className="p-4 text-muted-foreground text-xs hidden md:table-cell">
                                                        {entry.reservation_expires_at ? (
                                                            <span className="flex items-center gap-1.5 font-bold text-orange-500">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {new Date(entry.reservation_expires_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                                                            </span>
                                                        ) : "—"}
                                                    </td>
                                                    <td className="p-4">{getStatusBadge(entry.status)}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {entry.status === "waiting" && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handlePromote(entry.id)}
                                                                    disabled={pending}
                                                                    className="h-8 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold gap-1 cursor-pointer"
                                                                >
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                    Promote
                                                                </Button>
                                                            )}
                                                            {entry.status === "reserved" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleSkip(entry.id)}
                                                                    disabled={pending}
                                                                    className="h-8 rounded-xl text-neutral-400 hover:text-white border-neutral-800 text-xs font-bold gap-1 cursor-pointer"
                                                                >
                                                                    <SkipForward className="h-3.5 w-3.5" />
                                                                    Skip
                                                                </Button>
                                                            )}
                                                            {isActive && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleRemove(entry.id)}
                                                                    disabled={pending}
                                                                    className="h-8 rounded-xl text-destructive hover:bg-destructive/10 text-xs font-bold gap-1 cursor-pointer"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Remove
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* History queue table */}
                    {historyWaitlist.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-extrabold text-muted-foreground">Queue History</h2>
                            <div className="rounded-3xl border overflow-hidden bg-background opacity-70">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/20">
                                            <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">#</th>
                                            <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">Student</th>
                                            <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Joined</th>
                                            <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyWaitlist.map((entry) => (
                                            <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/10">
                                                <td className="p-4 font-extrabold text-muted-foreground">#{entry.position}</td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-bold text-xs">{entry.profile?.full_name || "Unknown"}</p>
                                                        <p className="text-[10px] text-muted-foreground">{entry.profile?.email || ""}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-muted-foreground text-xs hidden sm:table-cell">
                                                    {new Date(entry.joined_at || entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                </td>
                                                <td className="p-4">{getStatusBadge(entry.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
