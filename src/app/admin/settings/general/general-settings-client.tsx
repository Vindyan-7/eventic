"use client";

import { useState } from "react";
import { updatePlatformGeneralSettings } from "@/app/admin/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Settings, Save, Globe, Phone, Mail, Clock } from "lucide-react";

export function GeneralSettingsClient({ initialSettings }: { initialSettings: any }) {
  const [formData, setFormData] = useState({
    platform_name: initialSettings.platform_name || "Eventic",
    platform_description: initialSettings.platform_description || "",
    support_email: initialSettings.support_email || "",
    support_phone: initialSettings.support_phone || "",
    timezone: initialSettings.timezone || "UTC",
    date_format: initialSettings.date_format || "YYYY-MM-DD",
    time_format: initialSettings.time_format || "12h",
    platform_url: initialSettings.platform_url || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePlatformGeneralSettings(formData);
      toast.success("General settings updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update configurations");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-neutral-400" /> General Platform Configuration
          </h2>
          <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Manage support emails, default timezone ranges, and landing names</p>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5 text-xs"
        >
          <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 text-xs">
        <div className="space-y-2">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Platform Name</label>
          <input
            type="text"
            value={formData.platform_name}
            onChange={e => setFormData({ ...formData, platform_name: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Platform Base URL</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
            <input
              type="url"
              value={formData.platform_url}
              onChange={e => setFormData({ ...formData, platform_url: e.target.value })}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Platform Subtext / Description</label>
          <textarea
            value={formData.platform_description}
            onChange={e => setFormData({ ...formData, platform_description: e.target.value })}
            className="w-full h-20 p-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Support Contacts Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
            <input
              type="email"
              value={formData.support_email}
              onChange={e => setFormData({ ...formData, support_email: e.target.value })}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Support Helpline Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={formData.support_phone}
              onChange={e => setFormData({ ...formData, support_phone: e.target.value })}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Default Time Zone</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
            <select
              value={formData.timezone}
              onChange={e => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700 cursor-pointer"
            >
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="IST">IST (Indian Standard Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Default Date Format</label>
          <select
            value={formData.date_format}
            onChange={e => setFormData({ ...formData, date_format: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700 cursor-pointer"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-06-30)</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY (30-06-2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (06/30/2026)</option>
          </select>
        </div>
      </div>
    </form>
  );
}
