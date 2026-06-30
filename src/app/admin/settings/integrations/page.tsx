"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sliders, Link2, Link2Off, Calendar, MessageSquare, Video, Settings } from "lucide-react";

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: any;
  category: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    { id: "gcal", name: "Google Calendar", description: "Automatically sync public event dates to Google Calendar", connected: false, icon: Calendar, category: "Calendar" },
    { id: "slack", name: "Slack Notifications", description: "Post updates to a Slack channel when fests are created", connected: false, icon: MessageSquare, category: "Communication" },
    { id: "discord", name: "Discord Webhook", description: "Post tickets registration alerts to a Discord channel", connected: true, icon: MessageSquare, category: "Communication" },
    { id: "zoom", name: "Zoom Meetings", description: "Automatically generate Zoom link rooms for online hackathons", connected: false, icon: Video, category: "Video Conferencing" },
    { id: "whatsapp", name: "WhatsApp Broadcast", description: "Send tickets and confirmation QR codes directly via WhatsApp message", connected: false, icon: MessageSquare, category: "Communication" }
  ]);

  const handleToggle = (id: string, currentStatus: boolean) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, connected: !currentStatus };
      }
      return item;
    }));
    toast.success(`${integrations.find(i => i.id === id)?.name} ${!currentStatus ? "connected" : "disconnected"} successfully`);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-neutral-900 pb-4">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Sliders className="h-5 w-5 text-neutral-400" /> Platform Integrations Hub
        </h2>
        <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Connect third-party workspace APIs to sync calendars, alerts, and notifications</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 text-xs">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="border border-neutral-900 bg-neutral-900/10 p-5 rounded-3xl flex flex-col justify-between gap-4"
            >
              <div className="flex gap-3">
                <div className="bg-neutral-900 p-2.5 rounded-2xl h-10 w-10 flex items-center justify-center shrink-0 border border-neutral-850">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs">{item.name}</span>
                    <span className="bg-neutral-900 px-2 py-0.5 rounded text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-neutral-500 font-bold text-[10px] leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-neutral-900/60 pt-3">
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <div className={`h-2 w-2 rounded-full ${item.connected ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
                  <span className={item.connected ? "text-emerald-400" : "text-neutral-500"}>
                    {item.connected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <Button
                  onClick={() => handleToggle(item.id, item.connected)}
                  className={`font-extrabold gap-1.5 cursor-pointer rounded-xl h-8 px-3 text-[10px] ${
                    item.connected
                      ? "bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-850"
                      : "bg-white text-black hover:bg-neutral-200"
                  }`}
                >
                  {item.connected ? (
                    <>
                      <Link2Off className="h-3 w-3" /> Disconnect
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3 w-3" /> Connect API
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
