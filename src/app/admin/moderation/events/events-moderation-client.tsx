"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminBadge,
  AdminEmptyState
} from "@/components/admin/ui";
import { EventDetailDrawer } from "@/components/admin/drawers";
import { hideEvent, cancelEvent, archiveEvent, deleteEvent } from "@/app/admin/actions";
import { toast } from "sonner";
import {
  Calendar,
  Eye,
  EyeOff,
  Trash2,
  Ban,
  Archive,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventRecord {
  id: string;
  title: string;
  venue: string | null;
  starts_at: string;
  status: string;
  is_hidden: boolean;
  moderation_reason: string | null;
  organization_name: string;
  registrations_count: number;
}

export function EventsModerationClient({ initialEvents }: { initialEvents: EventRecord[] }) {
  const [events, setEvents] = useState<EventRecord[]>(initialEvents);
  const [activeDrawerId, setActiveDrawerId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Moderation Hide Modal State
  const [hidingEventId, setHidingEventId] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState("Policy Violation");

  const handleHide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hidingEventId) return;

    startTransition(async () => {
      try {
        await hideEvent(hidingEventId, true, hideReason);
        setEvents(prev => prev.map(evt => evt.id === hidingEventId ? { ...evt, is_hidden: true, moderation_reason: hideReason } : evt));
        toast.success("Event hidden from public discovery list");
        setHidingEventId(null);
      } catch (err: any) {
        toast.error(err.message || "Failed to hide event");
      }
    });
  };

  const handleUnhide = (id: string) => {
    startTransition(async () => {
      try {
        await hideEvent(id, false);
        setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, is_hidden: false, moderation_reason: null } : evt));
        toast.success("Event visibility restored");
      } catch (err: any) {
        toast.error(err.message || "Failed to restore event");
      }
    });
  };

  const handleCancel = (id: string) => {
    if (!confirm("Are you sure you want to cancel this event? This action is public.")) return;
    startTransition(async () => {
      try {
        await cancelEvent(id);
        setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, status: "cancelled" } : evt));
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
        setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, status: "archived" } : evt));
        toast.success("Event archived successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to archive event");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this event listing? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteEvent(id);
        setEvents(prev => prev.filter(evt => evt.id !== id));
        toast.success("Event deleted permanently");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete event");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans">
      <AdminHeader
        title="Event Moderation Portal"
        description="Audit listings, hide policy-violating events, and manage visibility states"
      />

      <div className="relative">
        <AdminTable headers={["Event details", "Host Org", "Schedule", "Registrations", "Status", "Visibility", "Reason", "Moderation Actions"]}>
          {events.map((evt) => (
            <tr key={evt.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
              <td className="p-4">
                <div>
                  <span className="font-extrabold text-white block text-sm leading-none mb-1">{evt.title}</span>
                  <span className="text-xs text-neutral-500 block">venue: {evt.venue || "TBD"}</span>
                </div>
              </td>
              <td className="p-4 text-xs text-neutral-400">
                {evt.organization_name}
              </td>
              <td className="p-4 text-xs text-neutral-400">
                {new Date(evt.starts_at).toLocaleDateString()}
              </td>
              <td className="p-4 text-xs font-bold text-white">
                {evt.registrations_count} users
              </td>
              <td className="p-4 text-xs font-bold uppercase tracking-wider">
                {evt.status === "published" ? (
                  <span className="text-emerald-400">Published</span>
                ) : evt.status === "cancelled" ? (
                  <span className="text-red-400">Cancelled</span>
                ) : (
                  <span className="text-neutral-450">{evt.status}</span>
                )}
              </td>
              <td className="p-4 text-xs">
                {evt.is_hidden ? (
                  <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">Hidden</span>
                ) : (
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Public</span>
                )}
              </td>
              <td className="p-4 text-xs text-neutral-500 max-w-44 truncate">
                {evt.moderation_reason || "-"}
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setActiveDrawerId(evt.id)}
                    className="text-neutral-400 hover:text-white cursor-pointer size-8"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {evt.is_hidden ? (
                    <Button
                      size="xs"
                      onClick={() => handleUnhide(evt.id)}
                      className="bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 hover:bg-emerald-950/60 text-xs font-bold gap-1 cursor-pointer rounded-lg px-2 h-8"
                    >
                      <Eye className="h-3.5 w-3.5" /> Restore
                    </Button>
                  ) : (
                    <Button
                      size="xs"
                      onClick={() => setHidingEventId(evt.id)}
                      className="bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/60 text-xs font-bold gap-1 cursor-pointer rounded-lg px-2 h-8"
                    >
                      <EyeOff className="h-3.5 w-3.5" /> Hide public
                    </Button>
                  )}

                  {evt.status !== "cancelled" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCancel(evt.id)}
                      className="text-neutral-400 hover:text-red-400 cursor-pointer size-8"
                      title="Cancel Event"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}

                  {evt.status !== "archived" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleArchive(evt.id)}
                      className="text-neutral-400 hover:text-white cursor-pointer size-8"
                      title="Archive Event"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(evt.id)}
                    className="text-neutral-500 hover:text-red-400 cursor-pointer size-8"
                    title="Delete Event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>

      {/* Hide event dialog overlay */}
      {hidingEventId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-base font-extrabold text-white">Hide Event Listing</h3>
              <Button variant="ghost" size="xs" onClick={() => setHidingEventId(null)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            <form onSubmit={handleHide} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Reason for hiding</label>
                <select
                  value={hideReason}
                  onChange={e => setHideReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                >
                  <option value="Duplicate">Duplicate</option>
                  <option value="Spam">Spam</option>
                  <option value="Policy Violation">Policy Violation</option>
                  <option value="Cancelled by Organizer">Cancelled by Organizer</option>
                </select>
              </div>
              <Button type="submit" disabled={isPending} className="w-full h-10 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer mt-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-black" /> : "Moderate Event"}
              </Button>
            </form>
          </div>
        </div>
      )}

      <EventDetailDrawer
        eventId={activeDrawerId}
        isOpen={!!activeDrawerId}
        onClose={() => setActiveDrawerId(null)}
      />
    </div>
  );
}
