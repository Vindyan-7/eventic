"use client";

import { useState, useEffect, useRef } from "react";
import { globalAdminSearch } from "@/app/admin/actions";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";

export function AdminSearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({ users: [], orgs: [], events: [], tickets: [], scanners: [] });
  const [focused, setFocused] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ users: [], orgs: [], events: [], tickets: [], scanners: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await globalAdminSearch(query);
        setResults(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults =
    results.users?.length > 0 ||
    results.orgs?.length > 0 ||
    results.events?.length > 0 ||
    results.tickets?.length > 0 ||
    results.scanners?.length > 0;

  return (
    <div ref={containerRef} className="relative w-64 font-sans">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search console..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 transition-all"
        />
        {loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-neutral-500 animate-spin" />}
      </div>

      {focused && (query.trim().length >= 2 || hasResults) && (
        <div className="absolute left-0 mt-2 z-50 rounded-2xl border border-neutral-850 bg-neutral-950 p-3 shadow-2xl max-h-96 overflow-y-auto text-xs w-80 animate-in fade-in slide-in-from-top-1">
          {loading ? (
            <p className="text-neutral-500 text-center py-4">Searching database...</p>
          ) : !hasResults ? (
            <p className="text-neutral-500 text-center py-4">No console results matched.</p>
          ) : (
            <div className="space-y-4">
              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">Users</h4>
                  <div className="space-y-1">
                    {results.users.map((u: any) => (
                      <Link
                        key={u.id}
                        href="/admin/users"
                        onClick={() => { setFocused(false); setQuery(""); }}
                        className="block p-2 rounded-lg hover:bg-neutral-900 transition-colors"
                      >
                        <p className="font-bold text-white">{u.full_name || "Eventic User"}</p>
                        <p className="text-[10px] text-neutral-500">{u.email}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Orgs */}
              {results.orgs.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">Organizations</h4>
                  <div className="space-y-1">
                    {results.orgs.map((o: any) => (
                      <Link
                        key={o.id}
                        href="/admin/organizations"
                        onClick={() => { setFocused(false); setQuery(""); }}
                        className="block p-2 rounded-lg hover:bg-neutral-900 transition-colors"
                      >
                        <p className="font-bold text-white">{o.name}</p>
                        <p className="text-[10px] text-neutral-500">slug: {o.slug}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {results.events.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">Events</h4>
                  <div className="space-y-1">
                    {results.events.map((e: any) => (
                      <Link
                        key={e.id}
                        href="/admin/events"
                        onClick={() => { setFocused(false); setQuery(""); }}
                        className="block p-2 rounded-lg hover:bg-neutral-900 transition-colors"
                      >
                        <p className="font-bold text-white">{e.title}</p>
                        <p className="text-[10px] text-neutral-500">slug: {e.slug}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tickets */}
              {results.tickets?.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">Tickets</h4>
                  <div className="space-y-1">
                    {results.tickets.map((t: any) => (
                      <Link
                        key={t.id}
                        href="/admin/tickets"
                        onClick={() => { setFocused(false); setQuery(""); }}
                        className="block p-2 rounded-lg hover:bg-neutral-900 transition-colors"
                      >
                        <p className="font-bold text-white font-mono">{t.ticket_number}</p>
                        <p className="text-[10px] text-neutral-500">{t.attendee_name} ({t.attendee_email})</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Scanners */}
              {results.scanners?.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1.5">Scanner Codes</h4>
                  <div className="space-y-1">
                    {results.scanners.map((s: any) => (
                      <Link
                        key={s.id}
                        href="/admin/scanner"
                        onClick={() => { setFocused(false); setQuery(""); }}
                        className="block p-2 rounded-lg hover:bg-neutral-900 transition-colors"
                      >
                        <p className="font-bold text-white font-mono">{s.code}</p>
                        <p className="text-[10px] text-neutral-500">Event: {s.event_title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
