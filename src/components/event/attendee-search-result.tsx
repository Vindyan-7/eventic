"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { checkInAttendee } from "@/services/event-attendance";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CheckCircle2, Calendar, Mail, User, Clock, Ticket, Loader2 } from "lucide-react";
import { SearchAttendeeResult } from "@/services/search-attendees";

interface Props {
    attendee: SearchAttendeeResult;
    isSelected: boolean;
    onSelect: () => void;
    onCheckInSuccess: (registrationId: string, checkedInAt: string) => void;
}

export function AttendeeSearchResult({
    attendee,
    isSelected,
    onSelect,
    onCheckInSuccess,
}: Props) {
    const [pending, startTransition] = useTransition();
    const [sheetOpen, setSheetOpen] = useState(false);

    const profile = attendee.profiles;
    const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "?";

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDateOnly = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const handleManualCheckIn = (e: React.MouseEvent) => {
        e.stopPropagation(); // Avoid triggering card selection
        if (attendee.checked_in) return;

        startTransition(async () => {
            const res = await checkInAttendee(attendee.id);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            toast.success("Attendee checked in successfully");
            onCheckInSuccess(attendee.id, res.checkedInAt || new Date().toISOString());
        });
    };

    return (
        <>
            <div
                onClick={onSelect}
                className={`rounded-2xl border p-5 space-y-4 transition-all duration-200 cursor-pointer ${
                    isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/5"
                        : "border-border/60 bg-card hover:bg-muted/30"
                }`}
            >
                {/* Header info */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar size="lg">
                            {profile?.avatar_url ? (
                                <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Avatar"} />
                            ) : null}
                            <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-bold text-base text-foreground">
                                {profile?.full_name || "Unnamed Attendee"}
                            </h4>
                            <p className="text-xs text-muted-foreground break-all flex items-center gap-1.5 mt-0.5">
                                <Mail className="h-3 w-3 shrink-0" />
                                {profile?.email}
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                        {attendee.checked_in ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                Checked In
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                Pending
                            </span>
                        )}
                    </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-3 text-xs border-t border-border/40 pt-3">
                    <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Ticket Number</span>
                        <span className="font-mono font-bold text-foreground mt-0.5 block">
                            {attendee.ticket_number || "N/A"}
                        </span>
                    </div>
                    <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Registered</span>
                        <span className="font-medium text-foreground mt-0.5 block">
                            {formatDateOnly(attendee.created_at)}
                        </span>
                    </div>
                </div>

                {/* Actions footer */}
                <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSheetOpen(true);
                        }}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                        View Ticket Details
                    </button>

                    <div>
                        {attendee.checked_in ? (
                            <div className="text-right">
                                <span className="text-[10px] text-emerald-500 font-bold block flex items-center justify-end gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Checked In
                                </span>
                                <span className="text-[9px] text-muted-foreground block mt-0.5">
                                    At: {attendee.checked_in_at ? formatDateTime(attendee.checked_in_at) : "N/A"}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={handleManualCheckIn}
                                disabled={pending}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                                {pending ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Checking In...
                                    </>
                                ) : (
                                    <>
                                        Check In
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide-over Ticket Details Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md p-6">
                    <SheetHeader className="border-b pb-4 mb-6">
                        <SheetTitle className="text-xl font-bold flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-primary" /> Ticket Details
                        </SheetTitle>
                        <SheetDescription>
                            Review full attendee registration details.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6">
                        {/* Attendee Profile Section */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border">
                            <Avatar size="lg" className="h-12 w-12">
                                {profile?.avatar_url ? (
                                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Avatar"} />
                                ) : null}
                                <AvatarFallback className="text-lg font-bold">{initial}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="font-extrabold text-lg leading-none">{profile?.full_name || "Unnamed Attendee"}</h3>
                                <p className="text-sm text-muted-foreground break-all">{profile?.email}</p>
                            </div>
                        </div>

                        {/* Ticket Stats */}
                        <div className="space-y-4">
                            <h4 className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground">Information</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-xl bg-card border">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Ticket Number</span>
                                    <span className="font-mono text-sm font-bold text-foreground mt-1 block">
                                        {attendee.ticket_number}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-card border">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Status</span>
                                    <div className="mt-1 block">
                                        {attendee.checked_in ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-bold">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Checked In
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-yellow-500 text-xs font-bold">
                                                <Clock className="h-3.5 w-3.5" /> Pending
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-card border">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Registered Date</span>
                                    <span className="text-sm font-semibold text-foreground mt-1 block">
                                        {formatDateOnly(attendee.created_at)}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-card border col-span-2">
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Internal ID (UUID)</span>
                                    <span className="font-mono text-[10px] text-muted-foreground break-all mt-1 block">
                                        {attendee.id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Check-In Detail status block */}
                        {attendee.checked_in && (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-700 dark:text-emerald-400 space-y-1">
                                <p className="font-bold text-sm flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4.5 w-4.5" /> Checked In Successfully
                                </p>
                                <p className="text-xs opacity-90">
                                    Checked In At: {attendee.checked_in_at ? formatDateTime(attendee.checked_in_at) : "N/A"}
                                </p>
                            </div>
                        )}

                        {/* Action block inside sheet */}
                        {!attendee.checked_in && (
                            <div className="pt-4 border-t flex flex-col gap-3">
                                <button
                                    onClick={handleManualCheckIn}
                                    disabled={pending}
                                    className="w-full rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                                >
                                    {pending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Checking In...
                                        </>
                                    ) : (
                                        <>
                                            Confirm Check-In
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
