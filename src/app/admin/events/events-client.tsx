"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminBadge,
  AdminEmptyState
} from "@/components/admin/ui";
import { EventDetailDrawer } from "@/components/admin/drawers";
import {
  featureEvent,
  cancelEvent,
  deleteEvent,
  archiveEvent
} from "@/app/admin/actions";
import { exportToCSV } from "@/lib/admin/export";
import { toast } from "sonner";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Download,
  Star,
  Ban,
  Trash2,
  Eye,
  Calendar,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  slug: string;
  venue: string | null;
  starts_at: string;
  ends_at: string | null;
  max_attendees: number | null;
  is_paid: boolean;
  ticket_price: number | null;
  status: "draft" | "published" | "completed" | "cancelled" | "archived";
  created_at: string;
  is_featured: boolean;
  organization_name: string;
  registrations_count: number;
  revenue: number;
}

export function EventsClient({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents);

  // States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "completed" | "cancelled">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "free" | "paid">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "registrations" | "revenue">("newest");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredEvents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEvents.map(e => e.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Individual Actions
  const handleFeature = (id: string, featured: boolean) => {
    startTransition(async () => {
      try {
        await featureEvent(id, featured);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, is_featured: featured } : e));
        toast.success(featured ? "Event featured on homepage" : "Event removed from featured list");
      } catch (err: any) {
        toast.error(err.message || "Failed to feature event");
      }
    });
  };

  const handleCancel = (id: string) => {
    if (!confirm("Are you sure you want to cancel this event? This action is public.")) return;
    startTransition(async () => {
      try {
        await cancelEvent(id);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "cancelled" } : e));
        toast.success("Event cancelled successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to cancel event");
      }
    });
  };

  const handleArchive = (id: string) => {
    if (!confirm("Are you sure you want to archive this event?")) return;
    startTransition(async () => {
      try {
        await archiveEvent(id);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "archived" as any } : e));
        toast.success("Event archived successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to archive event");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("CRITICAL: Permanent deletion will clear this event and all associated registrations/payments. Continue?")) return;
    startTransition(async () => {
      try {
        await deleteEvent(id);
        setEvents(prev => prev.filter(e => e.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        toast.success("Event deleted permanently");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete event");
      }
    });
  };

  // Bulk Actions
  const handleBulkCancel = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to cancel the ${selectedIds.length} selected events?`)) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await cancelEvent(id);
        }
        setEvents(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, status: "cancelled" } : e));
        toast.success(`Cancelled ${selectedIds.length} events`);
        setSelectedIds([]);
      } catch {
        toast.error("Bulk cancellation failed");
      }
    });
  };

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to archive the ${selectedIds.length} selected events?`)) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await archiveEvent(id);
        }
        setEvents(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, status: "archived" as any } : e));
        toast.success(`Archived ${selectedIds.length} events`);
        setSelectedIds([]);
      } catch {
        toast.error("Bulk archiving failed");
      }
    });
  };

  const handleBulkFeature = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        for (const id of selectedIds) {
          await featureEvent(id, true);
        }
        setEvents(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, is_featured: true } : e));
        toast.success(`Featured ${selectedIds.length} events`);
        setSelectedIds([]);
      } catch {
        toast.error("Bulk feature allocation failed");
      }
    });
  };

  const handleBulkExport = () => {
    const dataToExport = filteredEvents.map(e => ({
      ID: e.id,
      Title: e.title,
      Slug: e.slug,
      HostOrg: e.organization_name,
      Venue: e.venue || "",
      StartsAt: new Date(e.starts_at).toLocaleString(),
      Type: e.is_paid ? "Paid" : "Free",
      Price: e.ticket_price || 0,
      Status: e.status,
      Featured: e.is_featured ? "Yes" : "No",
      Registrations: e.registrations_count,
      TotalRevenue: e.revenue
    }));
    exportToCSV(dataToExport, "events");
    toast.success("Exported current events list to CSV");
  };

  // Filter & Sort
  const filteredEvents = events
    .filter(e => {
      const matchSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.organization_name.toLowerCase().includes(search.toLowerCase()) ||
        e.venue?.toLowerCase().includes(search.toLowerCase()) ||
        e.slug.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      const matchType =
        typeFilter === "all" ||
        (typeFilter === "paid" && e.is_paid) ||
        (typeFilter === "free" && !e.is_paid);

      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime();
      if (sortBy === "oldest") return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      if (sortBy === "registrations") return b.registrations_count - a.registrations_count;
      if (sortBy === "revenue") return b.revenue - a.revenue;
      return 0;
    });

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Events Management"
        description="Moderate fests, manage featured listings, and review ticket sales"
        actions={
          <Button
            onClick={handleBulkExport}
            disabled={filteredEvents.length === 0}
            className="h-10 px-4 rounded-xl text-xs bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 gap-1.5 cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      {/* Filter and Control actions panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-neutral-950 p-4 rounded-2xl border border-neutral-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by event name, org, or venue..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-neutral-500" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="all">All Pricing</option>
              <option value="free">Free Events</option>
              <option value="paid">Paid Events</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-neutral-500" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="newest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="registrations">Sort: Most Registrations</option>
            <option value="revenue">Sort: Highest Revenue</option>
          </select>
        </div>
      </div>

      {/* Bulk action selection bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-neutral-900/40 p-4 border border-neutral-850 rounded-2xl animate-in slide-in-from-top-1 text-xs justify-between">
          <div className="text-neutral-300 font-bold">
            {selectedIds.length} events selected
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBulkFeature}
              disabled={isPending}
              className="h-8 px-3 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-850 gap-1.5 cursor-pointer"
            >
              <Star className="h-3.5 w-3.5 fill-white" /> Feature Selected
            </Button>
            <Button
              onClick={handleBulkCancel}
              disabled={isPending}
              className="h-8 px-3 rounded-lg text-xs bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/60 gap-1.5 cursor-pointer"
            >
              <Ban className="h-3.5 w-3.5" /> Cancel Selected
            </Button>
            <Button
              onClick={handleBulkArchive}
              disabled={isPending}
              className="h-8 px-3 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-850 gap-1.5 cursor-pointer"
            >
              <Archive className="h-3.5 w-3.5" /> Archive Selected
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelectedIds([])}
              className="text-neutral-400 hover:text-white"
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <AdminEmptyState
          title="No events match current filters"
          description="Refine your active search parameters or filters."
          icon={Calendar}
        />
      ) : (
        <div className="relative">
          <AdminTable headers={["", "Event details", "Host Org", "Schedule & Pricing", "Stats", "Verification", ""]}>
            {filteredEvents.map((event) => {
              const isSelected = selectedIds.includes(event.id);
              return (
                <tr key={event.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(event.id)}
                      className="rounded border-neutral-800 bg-neutral-950 text-white accent-white cursor-pointer h-4 w-4"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="font-extrabold text-white block text-sm leading-none mb-1">{event.title}</span>
                      <span className="text-xs text-neutral-500 block">venue: {event.venue || "TBD"}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-neutral-400">
                    {event.organization_name}
                  </td>
                  <td className="p-4 text-xs">
                    <span className="block text-white font-bold">{new Date(event.starts_at).toLocaleDateString()}</span>
                    <span className="block text-neutral-500 text-[10px] mt-0.5">{event.is_paid ? `Paid: ₹${event.ticket_price}` : "Free Event"}</span>
                  </td>
                  <td className="p-4 text-xs">
                    <span className="block text-white font-bold">{event.registrations_count} registered</span>
                    <span className="block text-neutral-500 text-[10px] mt-0.5">₹{event.revenue.toLocaleString()} sales</span>
                  </td>
                  <td className="p-4 text-xs uppercase tracking-wider font-bold">
                    {event.status === "published" ? (
                      <span className="text-emerald-400">Published</span>
                    ) : event.status === "cancelled" ? (
                      <span className="text-red-400">Cancelled</span>
                    ) : event.status === "archived" ? (
                      <span className="text-neutral-500">Archived</span>
                    ) : (
                      <span className="text-neutral-400">{event.status}</span>
                    )}
                  </td>
                  <td className="p-4 relative">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveDrawerId(event.id)}
                        className="text-neutral-400 hover:text-white cursor-pointer size-8"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setActiveActionMenuId(activeActionMenuId === event.id ? null : event.id)}
                        className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {activeActionMenuId === event.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenuId(null)} />
                          <div className="absolute right-4 top-12 z-20 w-44 rounded-xl border border-neutral-850 bg-neutral-950 p-1.5 shadow-xl animate-in fade-in duration-200">
                            {event.is_featured ? (
                              <button
                                onClick={() => { handleFeature(event.id, false); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-neutral-300 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <Star className="h-3.5 w-3.5" /> Unfeature
                              </button>
                            ) : (
                              <button
                                onClick={() => { handleFeature(event.id, true); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-white hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <Star className="h-3.5 w-3.5 fill-white" /> Feature
                              </button>
                            )}
                            <div className="h-px bg-neutral-850 my-1" />
                            {event.status !== "cancelled" && (
                              <button
                                onClick={() => { handleCancel(event.id); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <Ban className="h-3.5 w-3.5" /> Cancel Event
                              </button>
                            )}
                            {event.status !== "archived" && (
                              <button
                                onClick={() => { handleArchive(event.id); setActiveActionMenuId(null); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-neutral-350 hover:bg-neutral-900 flex items-center gap-2 cursor-pointer"
                              >
                                <Archive className="h-3.5 w-3.5" /> Archive Event
                              </button>
                            )}
                            <button
                              onClick={() => { handleDelete(event.id); setActiveActionMenuId(null); }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
        </div>
      )}

      {/* Details drawer sheet */}
      <EventDetailDrawer
        eventId={activeDrawerId}
        isOpen={!!activeDrawerId}
        onClose={() => setActiveDrawerId(null)}
      />
    </div>
  );
}
