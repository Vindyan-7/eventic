"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable
} from "@/components/admin/ui";
import { createPlatformBanner, deletePlatformBanner } from "@/app/admin/actions";
import { toast } from "sonner";
import {
  Flag,
  Plus,
  Trash2,
  Calendar,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function BannersClient({ initialBanners }: { initialBanners: any[] }) {
  const [list, setList] = useState<any[]>(initialBanners);
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("notice");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().substring(0, 16));
  const [endsAt, setEndsAt] = useState("");
  const [priority, setPriority] = useState(0);
  const [isDismissible, setIsDismissible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Please fill in title and description content");
      return;
    }

    startTransition(async () => {
      try {
        await createPlatformBanner({
          title,
          content,
          type,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: endsAt ? new Date(endsAt).toISOString() : null,
          priority: Number(priority),
          is_dismissible: isDismissible
        });
        toast.success("Platform banner added successfully");
        setShowCreate(false);
        setList(prev => [
          {
            id: Math.random().toString(),
            title,
            content,
            type,
            starts_at: new Date(startsAt).toISOString(),
            ends_at: endsAt ? new Date(endsAt).toISOString() : null,
            priority: Number(priority),
            is_dismissible: isDismissible,
            created_at: new Date().toISOString()
          },
          ...prev
        ].sort((a, b) => b.priority - a.priority));
        // Reset form
        setTitle("");
        setContent("");
      } catch (err: any) {
        toast.error(err.message || "Failed to create banner");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this banner?")) return;
    startTransition(async () => {
      try {
        await deletePlatformBanner(id);
        setList(prev => prev.filter(b => b.id !== id));
        toast.success("Platform banner removed");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete banner");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      <div className="flex justify-between items-center">
        <AdminHeader
          title="Platform Banners Settings"
          description="Configure emergency notifications, product release banners, or alert highlights"
        />
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-10 px-4"
        >
          <Plus className="h-4 w-4" /> Create Banner
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-12 text-center text-xs text-neutral-500">
          No platform banners active yet. Click 'Create Banner' to configure the first one.
        </div>
      ) : (
        <div className="relative">
          <AdminTable headers={["Title & Content", "Priority", "Duration period", "Type classification", "Dismissible", "Actions"]}>
            {list.map((item) => (
              <tr key={item.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                <td className="p-4 max-w-sm">
                  <span className="font-extrabold text-white block text-sm mb-1">{item.title}</span>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{item.content}</p>
                </td>
                <td className="p-4 text-xs font-bold text-white">
                  Weight: {item.priority}
                </td>
                <td className="p-4 text-xs text-neutral-400">
                  <span className="block font-bold">Starts: {new Date(item.starts_at).toLocaleDateString()}</span>
                  <span className="block text-[10px] text-neutral-500 mt-0.5">
                    {item.ends_at ? `Ends: ${new Date(item.ends_at).toLocaleDateString()}` : "Until Dismissed"}
                  </span>
                </td>
                <td className="p-4 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    item.type === "emergency" ? "bg-red-950/40 border border-red-900/60 text-red-400" :
                    item.type === "release" ? "bg-emerald-950/40 border border-emerald-900/60 text-emerald-400" :
                    "bg-neutral-900 border border-neutral-800 text-neutral-400"
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-4 text-xs text-neutral-400">
                  {item.is_dismissible ? "Yes" : "No"}
                </td>
                <td className="p-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="text-neutral-500 hover:text-red-400 cursor-pointer size-8"
                    title="Remove Banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}

      {/* Create Banner Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Flag className="h-5 w-5" /> Configure Banner
              </h3>
              <Button variant="ghost" size="xs" onClick={() => setShowCreate(false)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Banner Title</label>
                <input
                  type="text"
                  placeholder="E.g. System update scheduled tonight..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Banner Message</label>
                <textarea
                  placeholder="Description details..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={3}
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
                    <option value="notice">Standard notice</option>
                    <option value="release">Feature Release</option>
                    <option value="emergency">Emergency Alert</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Display Weight Priority</label>
                  <input
                    type="number"
                    value={priority}
                    onChange={e => setPriority(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white outline-none focus:border-neutral-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Start Date</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={e => setStartsAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">End Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={e => setEndsAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-neutral-900 pt-3">
                <span className="text-neutral-400 font-bold">Dismissible by users</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDismissible}
                    onChange={e => setIsDismissible(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black peer-checked:after:border-black"></div>
                </label>
              </div>

              <Button type="submit" disabled={isPending} className="w-full h-10 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer mt-4">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-black" /> : "Deploy Banner"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
