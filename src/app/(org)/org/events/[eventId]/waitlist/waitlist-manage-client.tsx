"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { promoteWaitlistUser, removeWaitlistUser } from "@/services/waitlist";
import { CheckCircle, Trash2, SkipForward, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WaitlistEntry {
    id: string;
    event_id: string;
    position: number;
    status: "waiting" | "offered" | "claimed" | "expired";
    offered_at: string | null;
    expires_at: string | null;
    created_at: string;
    profile: { full_name: string; email: string } | null;
}

interface WaitlistManageClientProps {
    eventId: string;
    eventTitle: string;
    waitlist: WaitlistEntry[];
}

export function WaitlistManageClient({ eventId, eventTitle, waitlist }: WaitlistManageClientProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const handlePromote = (id: string) => {
        startTransition(async () => {
            const res = await promoteWaitlistUser(id);
            if (res.error) { toast.error(res.error); return; }
            toast.success("Seat offered to this student. They have 60 minutes to claim it.");
            router.refresh();
        });
    };

    const handleRemove = (id: string) => {
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
                return <span className="rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 text-[10px] font-bold uppercase">In Queue</span>;
            case "offered":
                return <span className="rounded-full bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-1 text-[10px] font-bold uppercase animate-pulse">Seat Offered</span>;
            case "claimed":
                return <span className="rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-1 text-[10px] font-bold uppercase">Claimed</span>;
            case "expired":
                return <span className="rounded-full bg-neutral-800 text-neutral-500 px-2.5 py-1 text-[10px] font-bold uppercase">Expired</span>;
        }
    };

    const waitingCount = waitlist.filter(w => w.status === "waiting").length;
    const offeredCount = waitlist.filter(w => w.status === "offered").length;

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm text-muted-foreground mb-1">Event Management</p>
                <h1 className="text-3xl font-bold">Waitlist Manager</h1>
                <p className="text-muted-foreground text-sm mt-1">{eventTitle}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-background p-4 space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Waitlisted</p>
                    <p className="text-2xl font-extrabold">{waitlist.length}</p>
                </div>
                <div className="rounded-2xl border bg-background p-4 space-y-1">
                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">In Queue</p>
                    <p className="text-2xl font-extrabold">{waitingCount}</p>
                </div>
                <div className="rounded-2xl border bg-background p-4 space-y-1">
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Seat Offered</p>
                    <p className="text-2xl font-extrabold">{offeredCount}</p>
                </div>
            </div>

            {waitlist.length === 0 ? (
                <div className="border rounded-3xl p-16 text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">No waitlist entries</h3>
                        <p className="text-muted-foreground text-sm mt-1">Students will appear here when the event reaches capacity.</p>
                    </div>
                </div>
            ) : (
                <div className="rounded-3xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30">
                                <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">#</th>
                                <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">Student</th>
                                <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Joined</th>
                                <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Offer Expires</th>
                                <th className="text-left p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="text-right p-4 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {waitlist.map((entry) => {
                                const profile = Array.isArray(entry.profile) ? entry.profile[0] : entry.profile;
                                const isActive = entry.status === "waiting" || entry.status === "offered";
                                return (
                                    <tr
                                        key={entry.id}
                                        className={`border-b last:border-0 transition-colors ${
                                            entry.status === "offered" ? "bg-green-500/5" : "hover:bg-muted/30"
                                        } ${!isActive ? "opacity-60" : ""}`}
                                    >
                                        <td className="p-4 font-extrabold text-muted-foreground">#{entry.position}</td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-bold">{profile?.full_name || "Unknown"}</p>
                                                <p className="text-[10px] text-muted-foreground">{profile?.email || ""}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground hidden sm:table-cell">
                                            {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </td>
                                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                                            {entry.expires_at ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-orange-500" />
                                                    {new Date(entry.expires_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
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
                                                {isActive && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRemove(entry.id)}
                                                        disabled={pending}
                                                        className="h-8 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 text-xs font-bold gap-1 cursor-pointer"
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
            )}
        </div>
    );
}
