"use client";

import React, { useState, useTransition, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Megaphone, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendEventAnnouncement } from "@/app/(org)/org/actions";
import { toast } from "sonner";
import Link from "next/link";

interface AnnouncePageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventAnnouncePage({ params }: AnnouncePageProps) {
  const { eventId } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Events");
  const [priority, setPriority] = useState("normal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Please fill out all fields.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await sendEventAnnouncement(eventId, {
          title,
          message,
          category,
          priority,
        });
        toast.success(`Announcement sent successfully to ${res.count} attendee(s)!`);
        router.push(`/org/events/${eventId}`);
      } catch (err: any) {
        toast.error(err.message || "Failed to send announcement");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground mb-2">
          <Link href={`/org/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" /> Back to Event
          </Link>
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="h-7 w-7 text-primary" />
          Send Announcement
        </h1>
        <p className="text-muted-foreground text-sm">
          Broadcast a direct notification to all registered attendees of this event.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border bg-background p-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Announcement Title</label>
            <input
              type="text"
              placeholder="e.g. Venue changed to Room 402"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border bg-muted/20 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Message Details</label>
            <textarea
              placeholder="Provide a detailed message description..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full p-4 rounded-xl border bg-muted/20 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border bg-muted/20 text-sm outline-none cursor-pointer focus:border-primary"
              >
                <option value="Events">Events</option>
                <option value="Tickets">Tickets</option>
                <option value="Workspace">Workspace</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border bg-muted/20 text-sm outline-none cursor-pointer focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-11 rounded-xl font-bold gap-2 cursor-pointer mt-4">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isPending ? "Sending Announcement..." : "Send Announcement"}
          </Button>
        </form>

        {/* Live Preview */}
        <div className="rounded-3xl border bg-muted/20 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              Attendee Live Preview
            </span>

            {/* Mock Item */}
            <div className="border rounded-2xl bg-background p-4 flex items-start gap-3 relative shadow-sm">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Megaphone className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {title || "Preview Title"}
                  </span>
                  <span className="text-[9px] text-muted-foreground/60 shrink-0">just now</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                  {message || "Provide a detailed message description..."}
                </p>
                <div className="flex gap-2 mt-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-muted text-muted-foreground">
                    {category}
                  </span>
                  {priority !== "normal" && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                        priority === "critical" ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
                      }`}
                    >
                      {priority}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0 animate-pulse" />
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-2 border-t pt-4">
            <span className="block font-bold">Important Notice:</span>
            <span className="block leading-relaxed">
              This message will be instantly sent to all verified attendees of the event. It will appear on their dashboard notification bell, email notification summary (if enabled), and active notification list. Use responsibly.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
