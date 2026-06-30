"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, Ticket, CheckCircle, AlertCircle } from "lucide-react";
import { claimWaitlistTicket } from "@/services/waitlist";
import { Button } from "@/components/ui/button";

interface WaitlistEntry {
    id: string;
    event_id: string;
    position: number;
    status: "waiting" | "offered" | "claimed" | "expired";
    offered_at: string | null;
    expires_at: string | null;
    created_at: string;
    event: {
        id: string;
        title: string;
        starts_at: string;
        slug: string;
    } | null;
}

interface WaitlistPageClientProps {
    waitlists: WaitlistEntry[];
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
    const [timeLeft, setTimeLeft] = useState(() => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        return Math.max(0, Math.floor(diff / 1000));
    });

    // Note: using useState with a computed initial value only.
    // For a real countdown we'd use useEffect but for SSR-safe simplicity we show static remaining time.
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <span className="text-orange-500 font-extrabold tabular-nums">
            {minutes}:{seconds.toString().padStart(2, "0")} remaining
        </span>
    );
}

export function WaitlistPageClient({ waitlists }: WaitlistPageClientProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [claimingId, setClaimingId] = useState<string | null>(null);

    const handleClaim = (eventId: string, waitlistId: string) => {
        setClaimingId(waitlistId);
        startTransition(async () => {
            const res = await claimWaitlistTicket(eventId);
            setClaimingId(null);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            toast.success("Ticket claimed! You're now registered.");
            router.refresh();
        });
    };

    const getStatusBadge = (status: WaitlistEntry["status"]) => {
        switch (status) {
            case "waiting":
                return <span className="rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">In Queue</span>;
            case "offered":
                return <span className="rounded-full bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider animate-pulse">Seat Available!</span>;
            case "claimed":
                return <span className="rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Claimed</span>;
            case "expired":
                return <span className="rounded-full bg-neutral-500/10 text-neutral-500 border border-neutral-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Expired</span>;
        }
    };

    const activeWaitlists = waitlists.filter(w => w.status === "waiting" || w.status === "offered");
    const historyWaitlists = waitlists.filter(w => w.status === "claimed" || w.status === "expired");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Waitlists</h1>
                <p className="text-muted-foreground text-sm mt-1">Track your waitlist positions and claim seats when available.</p>
            </div>

            {waitlists.length === 0 ? (
                <div className="border rounded-3xl p-16 text-center space-y-4 bg-background">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">No waitlist entries</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            When an event is full, you can join its waitlist and we'll notify you when a seat opens up.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-10">
                    {activeWaitlists.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-extrabold">Active Waitlists</h2>
                            <div className="space-y-4">
                                {activeWaitlists.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={`rounded-3xl border p-6 space-y-5 transition-all ${
                                            entry.status === "offered"
                                                ? "border-green-500/30 bg-green-500/5 shadow-green-500/10 shadow-lg"
                                                : "bg-background"
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="space-y-1">
                                                <h3 className="font-extrabold text-base">
                                                    {entry.event?.title || "Event"}
                                                </h3>
                                                <p className="text-muted-foreground text-xs">
                                                    {entry.event?.starts_at
                                                        ? new Date(entry.event.starts_at).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })
                                                        : ""}
                                                </p>
                                            </div>
                                            {getStatusBadge(entry.status)}
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold text-muted-foreground">
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider block">Your Position</span>
                                                <span className="text-foreground text-sm mt-0.5 block">#{entry.position}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider block">Joined Waitlist</span>
                                                <span className="text-foreground text-xs mt-0.5 block">
                                                    {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                </span>
                                            </div>
                                            {entry.status === "offered" && entry.expires_at && (
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider block text-orange-500">Time to Claim</span>
                                                    <CountdownTimer expiresAt={entry.expires_at} />
                                                </div>
                                            )}
                                        </div>

                                        {entry.status === "offered" && (
                                            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-extrabold text-green-500">A seat is reserved for you!</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Claim your ticket before the countdown ends or the seat will be offered to the next person.
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleClaim(entry.event_id, entry.id)}
                                                    disabled={pending && claimingId === entry.id}
                                                    className="shrink-0 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold gap-1.5 cursor-pointer"
                                                >
                                                    <Ticket className="h-4 w-4" />
                                                    {pending && claimingId === entry.id ? "Claiming..." : "Claim Ticket"}
                                                </Button>
                                            </div>
                                        )}

                                        {entry.status === "waiting" && (
                                            <div className="rounded-2xl border bg-muted/30 p-4 flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-muted-foreground">
                                                    You're <strong>#{entry.position}</strong> in the queue. We'll notify you instantly when a seat becomes available. Once notified, you'll have <strong>60 minutes</strong> to claim your ticket.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {historyWaitlists.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-extrabold text-muted-foreground">History</h2>
                            <div className="space-y-3 opacity-70">
                                {historyWaitlists.map((entry) => (
                                    <div key={entry.id} className="rounded-2xl border bg-background p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold text-sm">{entry.event?.title || "Event"}</h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                Joined {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </p>
                                        </div>
                                        {getStatusBadge(entry.status)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
