"use client";

import { useState, useTransition } from "react";
import { AdminHeader } from "@/components/admin/ui";
import { updateMaintenanceSettings } from "@/app/admin/actions";
import { toast } from "sonner";
import { ShieldAlert, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MaintenanceClient({ initialSettings }: { initialSettings: any }) {
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.maintenance_mode || false);
  const [message, setMessage] = useState(initialSettings.maintenance_message || "We are currently performing scheduled maintenance.");
  const [endTime, setEndTime] = useState(
    initialSettings.maintenance_estimated_end
      ? new Date(initialSettings.maintenance_estimated_end).toISOString().substring(0, 16)
      : ""
  );
  const [bannerColor, setBannerColor] = useState(initialSettings.maintenance_banner_color || "amber");

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateMaintenanceSettings({
          maintenance_mode: maintenanceMode,
          maintenance_message: message,
          maintenance_estimated_end: endTime || null,
          maintenance_banner_color: bannerColor
        });
        toast.success("Maintenance settings saved successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to update maintenance settings");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans pb-16 max-w-xl text-xs">
      <AdminHeader
        title="Maintenance Mode Control"
        description="Gracefully toggle platform-wide site lock with custom notice pages"
      />

      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400" /> Toggle Lock Mode
            </h3>
            <p className="text-neutral-500 text-[10px]">When active, all standard users are redirected to the Maintenance page.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={e => setMaintenanceMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black peer-checked:after:border-black"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-neutral-400 font-bold block">Status Banner Color</label>
            <select
              value={bannerColor}
              onChange={e => setBannerColor(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="amber">Amber Yellow Warning</option>
              <option value="red">Red Urgent Alert</option>
              <option value="blue">Blue Informational Notice</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-400 font-bold block">Notice Message Description</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-neutral-400 font-bold block">Estimated End Time (optional)</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 outline-none focus:border-neutral-700 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full h-10 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
