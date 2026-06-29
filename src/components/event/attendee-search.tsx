"use client";

import { useState, useEffect, useRef } from "react";
import { searchAttendees, SearchAttendeeResult } from "@/services/search-attendees";
import { AttendeeSearchResult } from "./attendee-search-result";
import { Input } from "@/components/ui/input";
import { Search, Loader2, UserX } from "lucide-react";

interface Props {
    eventId: string;
}

export function AttendeeSearch({ eventId }: Props) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [results, setResults] = useState<SearchAttendeeResult[]>([]);
    const [totalMatches, setTotalMatches] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Handle input debouncing (approximately 300ms)
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (query.trim().length < 2) {
            setDebouncedQuery("");
            setResults([]);
            setTotalMatches(0);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [query]);

    // 2. Fetch search results when debounced query updates
    useEffect(() => {
        if (!debouncedQuery) {
            return;
        }

        let isCurrent = true;

        async function fetchResults() {
            setError(null);
            try {
                const res = await searchAttendees(eventId, debouncedQuery);
                if (!isCurrent) return;

                if (res.error) {
                    setError(res.error);
                    setResults([]);
                    setTotalMatches(0);
                } else if (res.data) {
                    setResults(res.data);
                    setTotalMatches(res.totalMatches);
                }
            } catch (err: any) {
                if (!isCurrent) return;
                setError(err?.message || "Failed to search attendees");
                setResults([]);
                setTotalMatches(0);
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        }

        fetchResults();

        return () => {
            isCurrent = false;
        };
    }, [eventId, debouncedQuery]);

    // 3. Handle check-in success by updating the local result card status
    const handleCheckInSuccess = (registrationId: string, checkedInAt: string) => {
        setResults((prev) =>
            prev.map((item) =>
                item.id === registrationId
                    ? { ...item, checked_in: true, checked_in_at: checkedInAt }
                    : item
            )
        );
    };

    return (
        <div className="space-y-4 w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Quick Attendee Search
            </span>

            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by name, email or registration ID..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 h-10 rounded-xl"
                />
                {isLoading && (
                    <div className="absolute right-3 top-3.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-xs text-red-500 font-semibold p-2 border border-red-500/20 bg-red-50 dark:bg-red-950/20 rounded-xl">
                    {error}
                </div>
            )}

            {/* Results Section */}
            <div className="space-y-3">
                {/* Empty State: Search Box Empty */}
                {query.trim().length === 0 && (
                    <div className="text-center py-6 border border-dashed rounded-2xl bg-muted/10 text-muted-foreground text-xs font-medium">
                        Search by attendee name, email or registration ID.
                    </div>
                )}

                {/* Empty State: Query Entered but too short */}
                {query.trim().length > 0 && query.trim().length < 2 && (
                    <div className="text-center py-6 border border-dashed rounded-2xl bg-muted/10 text-muted-foreground text-xs font-medium">
                        Type at least 2 characters to search.
                    </div>
                )}

                {/* Empty State: Nothing Found */}
                {!isLoading && query.trim().length >= 2 && results.length === 0 && !error && (
                    <div className="text-center py-8 border border-dashed rounded-2xl bg-muted/20 text-muted-foreground flex flex-col items-center justify-center gap-2">
                        <UserX className="h-6 w-6 opacity-60" />
                        <span className="text-xs font-bold">No attendees found.</span>
                    </div>
                )}

                {/* Results List */}
                {!isLoading && results.length > 0 && (
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                        {totalMatches > 10 && (
                            <div className="text-[10px] font-bold text-muted-foreground bg-muted/30 border px-3 py-1.5 rounded-lg flex items-center justify-between">
                                <span>Showing first 10 matches.</span>
                                <span className="opacity-80">{totalMatches} total results</span>
                            </div>
                        )}

                        <div className="grid gap-3">
                            {results.map((attendee) => (
                                <AttendeeSearchResult
                                    key={attendee.id}
                                    attendee={attendee}
                                    isSelected={selectedId === attendee.id}
                                    onSelect={() => setSelectedId(attendee.id)}
                                    onCheckInSuccess={handleCheckInSuccess}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
