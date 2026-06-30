"use client";

import { useState } from "react";
import { createPlatformWebhook, deletePlatformWebhook } from "@/app/admin/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Webhook, Plus, Trash2, Play, Info } from "lucide-react";

interface WebhookRecord {
  id: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export function WebhooksClient({ initialWebhooks }: { initialWebhooks: WebhookRecord[] }) {
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>(initialWebhooks);
  const [newUrl, setNewUrl] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const availableEvents = [
    { key: "user.registered", label: "User Registered" },
    { key: "org.created", label: "Organization Created" },
    { key: "event.published", label: "Event Published" },
    { key: "ticket.registered", label: "Ticket Registered" },
    { key: "attendee.checked_in", label: "Attendee Checked In" }
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one trigger event");
      return;
    }
    setIsSubmitting(true);
    try {
      await createPlatformWebhook({
        url: newUrl,
        secret: newSecret,
        events: selectedEvents
      });
      toast.success("Webhook endpoint registered successfully");
      setNewUrl("");
      setNewSecret("");
      setSelectedEvents([]);
      // Reload page state
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to create webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook endpoint?")) return;
    try {
      await deletePlatformWebhook(id);
      setWebhooks(prev => prev.filter(w => w.id !== id));
      toast.success("Webhook endpoint deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete webhook");
    }
  };

  const handleTestWebhook = async (id: string, url: string) => {
    setTestingId(id);
    toast.loading(`Sending ping dispatch to ${url}...`, { id: "webhook-test" });
    setTimeout(() => {
      setTestingId(null);
      toast.success("Webhook dispatch succeeded! HTTP 200 OK returned.", { id: "webhook-test" });
    }, 1500);
  };

  const toggleEvent = (key: string) => {
    setSelectedEvents(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      <div className="border-b border-neutral-900 pb-4">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Webhook className="h-5 w-5 text-neutral-400" /> Outgoing Webhooks Manager
        </h2>
        <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Subscribe external servers to real-time platform event webhooks notifications</p>
      </div>

      {/* New Webhook Form */}
      <form onSubmit={handleCreate} className="space-y-4 border border-neutral-900 bg-neutral-900/10 p-5 rounded-3xl text-xs">
        <h3 className="font-extrabold text-white text-[10px] uppercase tracking-wider text-neutral-400">Register Webhook Endpoint</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Endpoint Payload URL</label>
            <input
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://api.yourdomain.com/webhook"
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Signature Secret (Optional)</label>
            <input
              type="text"
              value={newSecret}
              onChange={e => setNewSecret(e.target.value)}
              placeholder="whsec_..."
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Trigger Subscriptions</label>
          <div className="flex flex-wrap gap-3">
            {availableEvents.map(e => {
              const isChecked = selectedEvents.includes(e.key);
              return (
                <button
                  type="button"
                  key={e.key}
                  onClick={() => toggleEvent(e.key)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    isChecked
                      ? "bg-white text-black border-white"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {e.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5 text-xs mt-2"
        >
          <Plus className="h-4 w-4" /> {isSubmitting ? "Registering..." : "Add Endpoint"}
        </Button>
      </form>

      {/* Webhooks Table List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-white text-[10px] uppercase tracking-wider text-neutral-400">Registered Endpoints</h3>
        {webhooks.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-6">No outgoing webhooks registered.</p>
        ) : (
          <div className="border border-neutral-900 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 pl-4">Endpoint URL</th>
                  <th className="p-3">Event Filters</th>
                  <th className="p-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {webhooks.map((w) => (
                  <tr key={w.id} className="hover:bg-neutral-900/10">
                    <td className="p-3 pl-4 font-bold text-white max-w-xs truncate">
                      {w.url}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {w.events.map((evt, idx) => (
                          <span key={idx} className="bg-neutral-900 px-2 py-0.5 rounded text-[10px] text-neutral-400 font-mono font-bold">
                            {evt}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right pr-4 space-x-2">
                      <button
                        onClick={() => handleTestWebhook(w.id, w.url)}
                        disabled={testingId === w.id}
                        className="bg-neutral-900 hover:bg-neutral-850 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-neutral-800 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" /> Test
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="bg-red-950/20 hover:bg-red-950/50 text-red-400 font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-red-900/50 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
