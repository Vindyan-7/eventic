"use client";

import { CheckInButton } from "./check-in-button";
import { CheckCircle2, AlertTriangle, Calendar, Mail, User, Clock, Ticket } from "lucide-react";

interface Props {
    attendee: any;
    checkedIn: boolean;
    checkedInAt: string | null;
    alreadyCheckedIn: boolean;
    onCheckInSuccess?: (checkedInAt: string) => void;
}

export function ScanResultCard({
    attendee,
    checkedIn,
    checkedInAt,
    alreadyCheckedIn,
    onCheckInSuccess,
}: Props) {
    const profile = Array.isArray(attendee.profiles)
        ? attendee.profiles[0]
        : attendee.profiles;

    const event = Array.isArray(attendee.events)
        ? attendee.events[0]
        : attendee.events;

    // Determine status and styling
    let statusText = "Valid Ticket";
    let statusColorClass = "border-amber-500/20 bg-amber-500/10 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300";
    let badgeColorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    let StatusIcon = AlertTriangle;

    if (checkedIn) {
        if (alreadyCheckedIn) {
            statusText = "Already Checked In";
            statusColorClass = "border-amber-500/20 bg-amber-500/10 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300";
            badgeColorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
            StatusIcon = AlertTriangle;
        } else {
            statusText = "Checked In Successfully";
            statusColorClass = "border-emerald-500/20 bg-emerald-500/15 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-300";
            badgeColorClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            StatusIcon = CheckCircle2;
        }
    }

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

    return (
        <div className={`rounded-2xl border p-6 space-y-6 transition-all duration-300 ${statusColorClass}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StatusIcon className="h-5 w-5" />
                    <span className="font-extrabold tracking-tight">{statusText}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeColorClass}`}>
                    {event?.title || "Event"}
                </span>
            </div>

            <div className="space-y-3.5 border-t border-current/10 pt-4 text-sm">
                <div className="flex items-center gap-3">
                    <User className="h-4 w-4 opacity-70 shrink-0" />
                    <span className="font-semibold text-foreground">
                        {profile?.full_name ?? "Unknown Attendee"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 opacity-70 shrink-0" />
                    <span className="opacity-90">{profile?.email}</span>
                </div>

                <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 opacity-70 shrink-0" />
                    <div className="opacity-90">
                        <span className="text-xs font-semibold mr-1">Registered:</span>
                        <span>{formatDateTime(attendee.created_at)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 opacity-70 shrink-0" />
                    <div className="opacity-90">
                        <span className="text-xs font-semibold mr-1">Check-in:</span>
                        <span>
                            {checkedInAt ? formatDateTime(checkedInAt) : "Pending"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Ticket className="h-4 w-4 opacity-70 shrink-0" />
                    <div className="opacity-90">
                        <span className="text-xs font-semibold mr-1">Ticket Number:</span>
                        <span className="font-mono">{attendee.ticket_number || "N/A"}</span>
                    </div>
                </div>
            </div>

            {!checkedIn && (
                <div className="pt-2">
                    <CheckInButton
                        registrationId={attendee.id}
                        onSuccess={onCheckInSuccess}
                    />
                </div>
            )}
        </div>
    );
}