"use client";

import { useState, useTransition, useMemo } from "react";
import { EventAttendee } from "@/services/event-attendees";
import { checkInAttendee } from "@/services/event-attendance";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, Clock, Search, Loader2, ArrowUpDown } from "lucide-react";

interface Props {
    initialAttendees: EventAttendee[];
    eventMaxAttendees: number | null;
}

type FilterStatus = "all" | "checked_in" | "pending";
type SortOption = "name_asc" | "name_desc" | "date_desc" | "date_asc" | "ticket_asc" | "ticket_desc";

export function AttendeeListClient({ initialAttendees, eventMaxAttendees }: Props) {
    const [attendees, setAttendees] = useState<EventAttendee[]>(initialAttendees);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
    const [sortBy, setSortBy] = useState<SortOption>("date_asc");
    const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});

    // 1. Dynamic Stats computed from state
    const totalCount = attendees.length;
    const checkedInCount = attendees.filter((a) => a.checked_in).length;
    const pendingCount = totalCount - checkedInCount;
    
    const attendanceRate = totalCount === 0 
        ? 0 
        : Math.round((checkedInCount / totalCount) * 100);

    const capacityPercentage = eventMaxAttendees
        ? Math.round((totalCount / eventMaxAttendees) * 100)
        : null;

    // 2. Perform manual check-in
    const handleCheckIn = async (registrationId: string) => {
        setPendingMap((prev) => ({ ...prev, [registrationId]: true }));
        try {
            const res = await checkInAttendee(registrationId);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            toast.success("Attendee checked in successfully");
            
            // Update local state to reflect check-in instantly
            const checkedInAt = res.checkedInAt || new Date().toISOString();
            setAttendees((prev) =>
                prev.map((a) =>
                    a.registration_id === registrationId
                        ? { ...a, checked_in: true, checked_in_at: checkedInAt }
                        : a
                )
            );
        } catch (err: any) {
            toast.error(err?.message || "Failed to check in attendee");
        } finally {
            setPendingMap((prev) => ({ ...prev, [registrationId]: false }));
        }
    };

    // 3. Filtering & Sorting computed list
    const filteredAndSortedAttendees = useMemo(() => {
        let result = [...attendees];

        // Apply status filter
        if (statusFilter === "checked_in") {
            result = result.filter((a) => a.checked_in);
        } else if (statusFilter === "pending") {
            result = result.filter((a) => !a.checked_in);
        }

        // Apply search query (matches name, email, ticket_number suffix/prefix/exact)
        const query = searchQuery.trim().toLowerCase();
        if (query.length > 0) {
            result = result.filter((a) => {
                const fullName = (a.full_name || "").toLowerCase();
                const email = (a.email || "").toLowerCase();
                const ticketNum = (a.ticket_number || "").toLowerCase();
                const regId = (a.registration_id || "").toLowerCase();

                // Search matching name, email, full/partial ticket number or last 4 digits
                const matchesName = fullName.includes(query);
                const matchesEmail = email.includes(query);
                const matchesRegId = regId.includes(query) || regId.slice(-4) === query;
                const matchesTicketNum = ticketNum.includes(query) || ticketNum.slice(-4) === query;

                return matchesName || matchesEmail || matchesRegId || matchesTicketNum;
            });
        }

        // Apply sorting
        result.sort((a, b) => {
            if (sortBy === "name_asc") {
                return (a.full_name || "").localeCompare(b.full_name || "");
            }
            if (sortBy === "name_desc") {
                return (b.full_name || "").localeCompare(a.full_name || "");
            }
            if (sortBy === "date_desc") {
                return new Date(b.registered_at).getTime() - new Date(a.registered_at).getTime();
            }
            if (sortBy === "date_asc") {
                return new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime();
            }
            if (sortBy === "ticket_asc") {
                return (a.ticket_number || "").localeCompare(b.ticket_number || "");
            }
            if (sortBy === "ticket_desc") {
                return (b.ticket_number || "").localeCompare(a.ticket_number || "");
            }
            return 0;
        });

        return result;
    }, [attendees, searchQuery, statusFilter, sortBy]);

    return (
        <div className="space-y-8">
            {/* Dynamic Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border p-6 bg-card">
                    <p className="text-sm text-muted-foreground">Total Attendees</p>
                    <p className="text-3xl font-bold mt-2">{totalCount}</p>
                </div>

                <div className="rounded-2xl border p-6 bg-card">
                    <p className="text-sm text-muted-foreground">Checked In</p>
                    <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">{checkedInCount}</p>
                </div>

                <div className="rounded-2xl border p-6 bg-card">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold mt-2 text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
                </div>

                <div className="rounded-2xl border p-6 bg-card">
                    <p className="text-sm text-muted-foreground">Attendance</p>
                    <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">{attendanceRate}%</p>
                </div>
            </div>

            {/* Capacity Progress Bar */}
            {eventMaxAttendees && (
                <div className="rounded-2xl border p-6 bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold">Capacity</h2>
                        <span className="text-sm text-muted-foreground">
                            {totalCount} / {eventMaxAttendees}
                        </span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{
                                width: `${Math.min(100, capacityPercentage || 0)}%`,
                            }}
                        />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                        {capacityPercentage}% filled
                    </p>
                </div>
            )}

            {/* Search, Status Filter, and Sorting Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border p-4 rounded-2xl">
                {/* Search Bar */}
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by name, email or ticket number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 rounded-xl"
                    />
                </div>

                {/* Filter & Sort Controls */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Status Filter buttons */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border">
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                statusFilter === "all"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter("checked_in")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                statusFilter === "checked_in"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Checked In
                        </button>
                        <button
                            onClick={() => setStatusFilter("pending")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                statusFilter === "pending"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Pending
                        </button>
                    </div>

                    {/* Sorting Select */}
                    <div className="relative flex items-center bg-muted border p-1 rounded-xl">
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground ml-2 mr-1" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="bg-transparent border-0 text-xs font-semibold focus:ring-0 focus:outline-none pr-6 pl-1 py-1 cursor-pointer text-foreground appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 2px center', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
                        >
                            <option value="date_asc" className="bg-card">Date: Oldest first</option>
                            <option value="date_desc" className="bg-card">Date: Newest first</option>
                            <option value="name_asc" className="bg-card">Name: A to Z</option>
                            <option value="name_desc" className="bg-card">Name: Z to A</option>
                            <option value="ticket_asc" className="bg-card">Ticket: Low to High</option>
                            <option value="ticket_desc" className="bg-card">Ticket: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List Header and Count */}
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xl font-bold">Attendee List</h3>
                <span className="text-sm text-muted-foreground font-semibold">
                    Showing {filteredAndSortedAttendees.length} of {totalCount} registrations
                </span>
            </div>

            {/* Attendee Table Grid */}
            {filteredAndSortedAttendees.length === 0 ? (
                <div className="rounded-2xl border p-12 text-center bg-card">
                    <h4 className="text-lg font-semibold text-foreground">No matching attendees</h4>
                    <p className="text-muted-foreground text-sm mt-1">
                        Try refining your search query or choosing a different status filter.
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted border-b">
                                <tr>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ticket Number</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Check-In</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment</th>
                                    <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredAndSortedAttendees.map((attendee) => {
                                    const isCheckingIn = pendingMap[attendee.registration_id] || false;
                                    return (
                                        <tr key={attendee.registration_id} className="hover:bg-muted/10 transition-colors">
                                            <td className="p-4 font-semibold text-foreground">
                                                {attendee.full_name ?? "Unnamed User"}
                                            </td>
                                            <td className="p-4 font-mono text-sm text-foreground">
                                                {attendee.ticket_number || "N/A"}
                                            </td>
                                            <td className="p-4 text-muted-foreground break-all">
                                                {attendee.email}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(attendee.registered_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="p-4">
                                                {attendee.checked_in ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 px-3 py-1 text-xs font-bold border border-green-500/20">
                                                        Checked In
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 text-yellow-600 px-3 py-1 text-xs font-bold border border-yellow-500/20">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {attendee.payment_status === "paid" ? (
                                                    <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-medium dark:bg-blue-900/20 dark:text-blue-400">
                                                        Paid
                                                    </span>
                                                ) : attendee.payment_status === "pending" ? (
                                                    <span className="rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-medium dark:bg-yellow-900/20 dark:text-yellow-400">
                                                        Pending
                                                    </span>
                                                ) : attendee.payment_status === "failed" ? (
                                                    <span className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-medium dark:bg-red-900/20 dark:text-red-400">
                                                        Failed
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium dark:bg-slate-800 dark:text-slate-300">
                                                        Free
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {attendee.checked_in ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        {attendee.checked_in_at
                                                            ? new Date(attendee.checked_in_at).toLocaleString("en-IN", {
                                                                  day: "numeric",
                                                                  month: "short",
                                                                  hour: "numeric",
                                                                  minute: "2-digit",
                                                                  hour12: true,
                                                              })
                                                            : "-"}
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleCheckIn(attendee.registration_id)}
                                                        disabled={isCheckingIn}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                                                    >
                                                        {isCheckingIn ? (
                                                            <>
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Checking In...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                Check In
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
