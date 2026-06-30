"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable
} from "@/components/admin/ui";
import { createAnnouncement, deleteAnnouncement } from "@/app/admin/actions";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  Eye,
  Loader2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: any[] }) {
  const [list, setList] = useState<any[]>(initialAnnouncements);
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");
  const [visibility, setVisibility] = useState("all");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().substring(0, 16));
  const [expiresAt, setExpiresAt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Please fill in title and description content");
      return;
    }

    startTransition(async () => {
      try {
        await createAnnouncement({
          title,
          content,
          type,
          visibility,
          starts_at: new Date(startsAt).toISOString(),
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
        });
        toast.success("Announcement published successfully");
        setShowCreate(false);
        // Refresh page (soft reload or optimistic append)
        setList(prev => [
          {
            id: Math.random().toString(),
            title,
            content,
            type,
            visibility,
            starts_at: new Date(startsAt).toISOString(),
            expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        // Reset form
        setTitle("");
        setContent("");
      } catch (err: any) {
        toast.error(err.message || "Failed to create announcement");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this announcement?")) return;
    startTransition(async () => {
      try {
        await deleteAnnouncement(id);
        setList(prev => prev.filter(a => a.id !== id));
        toast.success("Announcement removed");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete announcement");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      <div className="flex justify-between items-center">
        <AdminHeader
          title="Announcements Dashboard"
          description="Broadcast important updates, warnings, and maintenance alerts across the platform"
        />
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-10 px-4"
        >
          <Plus className="h-4 w-4" /> Create Broadcast
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-12 text-center text-xs text-neutral-500">
          No announcements published yet. Click 'Create Broadcast' to publish the first one.
        </div>
      ) : (
        <div className="relative">
          <AdminTable headers={["Title & Content", "Channel Targeting", "Duration Period", "Classification Alert Type", "Actions"]}>
            {list.map((item) => (
              <tr key={item.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                <td className="p-4 max-w-sm">
                  <span className="font-extrabold text-white block text-sm mb-1">{item.title}</span>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{item.content}</p>
                </td>
                <td className="p-4 text-xs font-bold text-white uppercase tracking-wider">
                  {item.visibility}
                </td>
                <td className="p-4 text-xs text-neutral-400">
                  <span className="block font-bold">Starts: {new Date(item.starts_at).toLocaleDateString()}</span>
                  <span className="block text-[10px] text-neutral-500 mt-0.5">
                    {item.expires_at ? `Expires: ${new Date(item.expires_at).toLocaleDateString()}` : "Permanent"}
                  </span>
                </td>
                <td className="p-4 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    item.type === "emergency" ? "bg-red-950/40 border border-red-900/60 text-red-400" :
                    item.type === "warning" ? "bg-amber-950/40 border border-amber-900/60 text-amber-400" :
                    item.type === "success" ? "bg-emerald-950/40 border border-emerald-900/60 text-emerald-400" :
                    "bg-neutral-900 border border-neutral-800 text-neutral-400"
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="text-neutral-500 hover:text-red-400 cursor-pointer size-8"
                    title="Delete Broadcast"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Megaphone className="h-5 w-5" /> Broadcast Announcement
              </h3>
              <Button variant="ghost" size="xs" onClick={() => setShowCreate(false)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Announcement Title</label>
                <input
                  type="text"
                  placeholder="Platform system maintenance scheduled..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Content Message</label>
                <textarea
                  placeholder="Write the full description message content here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Alert Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                  >
                    <option value="info">Information</option>
                    <option value="success">Success Notice</option>
                    <option value="warning">Warning</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="emergency">Emergency Alert</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Target Audience</label>
                  <select
                    value={visibility}
                    onChange={e => setVisibility(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                  >
                    <option value="all">All Visitors & Users</option>
                    <option value="organizers">Host Organizers Only</option>
                    <option value="admins">Platform Admins Only</option>
                    <option value="staff">Check-in Staff Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Starts at</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={e => setStartsAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Expires at (optional)</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full h-10 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer mt-4">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-black" /> : "Publish Broadcast"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
