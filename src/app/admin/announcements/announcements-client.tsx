"use client";

import { useState, useTransition } from "react";
import {
  AdminHeader,
  AdminTable
} from "@/components/admin/ui";
import { createAnnouncement, deleteAnnouncement, broadcastNotificationAction } from "@/app/admin/actions";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  Eye,
  Loader2,
  Clock,
  Users,
  Send,
  Building2,
  Layout,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnnouncementsClientProps {
  initialAnnouncements: any[];
  organizations: { id: string; name: string }[];
  events: { id: string; title: string }[];
  initialBroadcasts: any[];
}

export function AnnouncementsClient({
  initialAnnouncements,
  organizations,
  events,
  initialBroadcasts
}: AnnouncementsClientProps) {
  const [activeTab, setActiveTab] = useState<"banners" | "broadcasts">("banners");
  const [banners, setBanners] = useState<any[]>(initialAnnouncements);
  const [broadcasts, setBroadcasts] = useState<any[]>(initialBroadcasts);
  const [showCreateBanner, setShowCreateBanner] = useState(false);
  const [showCreateBroadcast, setShowCreateBroadcast] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Legacy Banner Form Fields
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerContent, setBannerContent] = useState("");
  const [bannerType, setBannerType] = useState("info");
  const [bannerVisibility, setBannerVisibility] = useState("all");
  const [bannerStartsAt, setBannerStartsAt] = useState(new Date().toISOString().substring(0, 16));
  const [bannerExpiresAt, setBannerExpiresAt] = useState("");

  // Broadcast Form Fields
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastCategory, setBroadcastCategory] = useState("Platform");
  const [broadcastPriority, setBroadcastPriority] = useState("normal");
  const [broadcastActionUrl, setBroadcastActionUrl] = useState("");
  const [broadcastTargetType, setBroadcastTargetType] = useState("everyone");
  const [selectedTargetId, setSelectedTargetId] = useState("");

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerContent) {
      toast.error("Please fill in title and description content");
      return;
    }

    startTransition(async () => {
      try {
        await createAnnouncement({
          title: bannerTitle,
          content: bannerContent,
          type: bannerType,
          visibility: bannerVisibility,
          starts_at: new Date(bannerStartsAt).toISOString(),
          expires_at: bannerExpiresAt ? new Date(bannerExpiresAt).toISOString() : null
        });
        toast.success("Platform banner announcement published!");
        setShowCreateBanner(false);
        setBanners(prev => [
          {
            id: Math.random().toString(),
            title: bannerTitle,
            content: bannerContent,
            type: bannerType,
            visibility: bannerVisibility,
            starts_at: new Date(bannerStartsAt).toISOString(),
            expires_at: bannerExpiresAt ? new Date(bannerExpiresAt).toISOString() : null,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        setBannerTitle("");
        setBannerContent("");
      } catch (err: any) {
        toast.error(err.message || "Failed to create announcement banner");
      }
    });
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      toast.error("Please fill in title and message contents");
      return;
    }

    startTransition(async () => {
      try {
        const target: any = { type: broadcastTargetType };
        if (broadcastTargetType === "organization") {
          if (!selectedTargetId) {
            toast.error("Please select a target organization");
            return;
          }
          target.organizationId = selectedTargetId;
        } else if (broadcastTargetType === "event") {
          if (!selectedTargetId) {
            toast.error("Please select a target event");
            return;
          }
          target.eventId = selectedTargetId;
        }

        const res = await broadcastNotificationAction({
          title: broadcastTitle,
          message: broadcastMessage,
          category: broadcastCategory,
          priority: broadcastPriority,
          actionUrl: broadcastActionUrl || undefined,
          target
        });

        toast.success(`Successfully broadcasted to ${res.count} recipient(s)!`);
        setShowCreateBroadcast(false);
        setBroadcasts(prev => [
          {
            id: Math.random().toString(),
            title: broadcastTitle,
            message: broadcastMessage,
            category: broadcastCategory,
            priority: broadcastPriority,
            target_type: broadcastTargetType,
            recipient_count: res.count,
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        setBroadcastTitle("");
        setBroadcastMessage("");
        setBroadcastActionUrl("");
        setSelectedTargetId("");
      } catch (err: any) {
        toast.error(err.message || "Failed to broadcast notification");
      }
    });
  };

  const handleBannerDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this announcement banner?")) return;
    startTransition(async () => {
      try {
        await deleteAnnouncement(id);
        setBanners(prev => prev.filter(b => b.id !== id));
        toast.success("Announcement banner removed");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete announcement banner");
      }
    });
  };

  const getTargetLabel = (type: string, id: string | null) => {
    if (type === "everyone") return "Everyone";
    if (type === "users") return "All Students";
    if (type === "organizers") return "All Organizers";
    if (type === "volunteers") return "All Volunteers";
    if (type === "organization") {
      const org = organizations.find(o => o.id === id);
      return `Org: ${org?.name || "Specific Org"}`;
    }
    if (type === "event") {
      const ev = events.find(e => e.id === id);
      return `Event: ${ev?.title || "Specific Event"}`;
    }
    return type;
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <AdminHeader
          title="Announcements & Broadcasts"
          description="Manage active system-wide banners and broadcast targeted notifications to users"
        />
        <div className="flex gap-2">
          {activeTab === "banners" ? (
            <Button
              onClick={() => setShowCreateBanner(true)}
              className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-10 px-4"
            >
              <Plus className="h-4 w-4" /> Create Banner
            </Button>
          ) : (
            <Button
              onClick={() => setShowCreateBroadcast(true)}
              className="bg-primary text-primary-foreground hover:opacity-90 font-extrabold gap-1.5 cursor-pointer rounded-xl h-10 px-4"
            >
              <Send className="h-4 w-4" /> New Broadcast
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-900 pb-px gap-6 text-sm">
        <button
          onClick={() => setActiveTab("banners")}
          className={`pb-3 font-bold flex items-center gap-2 cursor-pointer transition-all border-b-2 ${
            activeTab === "banners"
              ? "border-white text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Layout className="h-4 w-4" /> Platform Banners ({banners.length})
        </button>
        <button
          onClick={() => setActiveTab("broadcasts")}
          className={`pb-3 font-bold flex items-center gap-2 cursor-pointer transition-all border-b-2 ${
            activeTab === "broadcasts"
              ? "border-white text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Megaphone className="h-4 w-4" /> Direct Broadcasts ({broadcasts.length})
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === "banners" ? (
        banners.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-12 text-center text-xs text-neutral-500">
            No platform announcement banners published yet. Click 'Create Banner' to set one up.
          </div>
        ) : (
          <AdminTable headers={["Title & Content", "Target Audience", "Duration Period", "Classification Alert Type", "Actions"]}>
            {banners.map((item) => (
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
                    onClick={() => handleBannerDelete(item.id)}
                    className="text-neutral-500 hover:text-red-400 cursor-pointer size-8"
                    title="Delete Announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </AdminTable>
        )
      ) : (
        broadcasts.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-12 text-center text-xs text-neutral-500">
            No targeted direct broadcasts sent yet. Click 'New Broadcast' to notify users.
          </div>
        ) : (
          <AdminTable headers={["Message Details", "Target Group", "Recipients", "Priority", "Sent At"]}>
            {broadcasts.map((item) => (
              <tr key={item.id} className="text-neutral-350 hover:bg-neutral-900/20 transition-colors">
                <td className="p-4 max-w-sm">
                  <span className="font-extrabold text-white block text-sm mb-1">{item.title}</span>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{item.message}</p>
                </td>
                <td className="p-4 text-xs font-bold text-white uppercase tracking-wider">
                  {getTargetLabel(item.target_type, item.target_id)}
                </td>
                <td className="p-4 text-xs text-neutral-400 font-bold">
                  {item.recipient_count} user(s)
                </td>
                <td className="p-4 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    item.priority === "critical" ? "bg-red-950/40 border border-red-900/60 text-red-400" :
                    item.priority === "high" ? "bg-amber-950/40 border border-amber-900/60 text-amber-400" :
                    "bg-neutral-900 border border-neutral-800 text-neutral-400"
                  }`}>
                    {item.priority}
                  </span>
                </td>
                <td className="p-4 text-xs text-neutral-500">
                  {new Date(item.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </AdminTable>
        )
      )}

      {/* Platform Banner Modal */}
      {showCreateBanner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" /> Create Platform Banner
              </h3>
              <Button variant="ghost" size="xs" onClick={() => setShowCreateBanner(false)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            <form onSubmit={handleBannerSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Announcement Title</label>
                <input
                  type="text"
                  placeholder="Platform system maintenance scheduled..."
                  value={bannerTitle}
                  onChange={e => setBannerTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-400 font-bold block">Content Message</label>
                <textarea
                  placeholder="Write the full description message content here..."
                  value={bannerContent}
                  onChange={e => setBannerContent(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Alert Type</label>
                  <select
                    value={bannerType}
                    onChange={e => setBannerType(e.target.value)}
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
                    value={bannerVisibility}
                    onChange={e => setBannerVisibility(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                  >
                    <option value="all">All Visitors & Users</option>
                    <option value="organizers">Host Organizers Only</option>
                    <option value="admins">Platform Admins Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Starts at</label>
                  <input
                    type="datetime-local"
                    value={bannerStartsAt}
                    onChange={e => setBannerStartsAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Expires at (optional)</label>
                  <input
                    type="datetime-local"
                    value={bannerExpiresAt}
                    onChange={e => setBannerExpiresAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full h-10 rounded-xl bg-white text-black font-extrabold hover:bg-neutral-200 cursor-pointer mt-4">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Publish Banner"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Direct Broadcast Modal */}
      {showCreateBroadcast && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" /> New Direct Broadcast Notification
              </h3>
              <Button variant="ghost" size="xs" onClick={() => setShowCreateBroadcast(false)} className="text-neutral-500 hover:text-white">Close</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Side */}
              <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Notification Title</label>
                  <input
                    type="text"
                    placeholder="New system update live!"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Message Body</label>
                  <textarea
                    placeholder="Provide a detailed message description..."
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">Category</label>
                    <select
                      value={broadcastCategory}
                      onChange={e => setBroadcastCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                    >
                      <option value="Platform">Platform</option>
                      <option value="Events">Events</option>
                      <option value="Tickets">Tickets</option>
                      <option value="Workspace">Workspace</option>
                      <option value="Volunteer">Volunteer</option>
                      <option value="Certificates">Certificates</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">Priority</label>
                    <select
                      value={broadcastPriority}
                      onChange={e => setBroadcastPriority(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-400 font-bold block">Action URL Link (optional)</label>
                  <input
                    type="text"
                    placeholder="/dashboard/tickets or custom path"
                    value={broadcastActionUrl}
                    onChange={e => setBroadcastActionUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 font-bold block">Target Audience</label>
                    <select
                      value={broadcastTargetType}
                      onChange={e => {
                        setBroadcastTargetType(e.target.value);
                        setSelectedTargetId("");
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="users">Students Only</option>
                      <option value="organizers">Organizers Only</option>
                      <option value="volunteers">Volunteers Only</option>
                      <option value="organization">Specific Org Members</option>
                      <option value="event">Specific Event Attendees</option>
                    </select>
                  </div>

                  {/* Dependent dropdown */}
                  {(broadcastTargetType === "organization" || broadcastTargetType === "event") && (
                    <div className="space-y-1.5">
                      <label className="text-neutral-400 font-bold block">
                        Select {broadcastTargetType === "organization" ? "Organization" : "Event"}
                      </label>
                      <select
                        value={selectedTargetId}
                        onChange={e => setSelectedTargetId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
                      >
                        <option value="">-- Choose one --</option>
                        {broadcastTargetType === "organization"
                          ? organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)
                          : events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)
                        }
                      </select>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isPending} className="w-full h-10 rounded-xl bg-white text-black font-extrabold hover:bg-neutral-200 cursor-pointer mt-4">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Send Notification Broadcast"}
                </Button>
              </form>

              {/* Preview Side */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Notification Center Live Preview</span>
                  
                  {/* Item Mockup */}
                  <div className="border rounded-2xl bg-neutral-950 p-4 flex items-start gap-3 relative">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Megaphone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-white block truncate">
                          {broadcastTitle || "Preview Title"}
                        </span>
                        <span className="text-[9px] text-neutral-500 shrink-0">just now</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-2">
                        {broadcastMessage || "Provide a detailed message description..."}
                      </p>
                      <div className="flex gap-2 mt-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-neutral-900 text-neutral-400">
                          {broadcastCategory}
                        </span>
                        {broadcastPriority !== "normal" && (
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                            broadcastPriority === "critical" ? "bg-red-950/40 text-red-400" : "bg-orange-950/40 text-orange-400"
                          }`}>
                            {broadcastPriority}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0 animate-pulse" />
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 leading-relaxed space-y-1 mt-6 border-t border-neutral-900 pt-3">
                  <span className="block font-bold">Targeted Audience Summary:</span>
                  <span className="block">
                    This notification will appear in the bell drawer and center for all active members matching the target. If users have enabled email delivery, they may also receive an email notification summary.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
