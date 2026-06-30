"use client";

import { useState } from "react";
import { updatePlatformBrandingSettings } from "@/app/admin/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Paintbrush, Save, Layout, ShieldAlert } from "lucide-react";

export function BrandingSettingsClient({ initialSettings }: { initialSettings: any }) {
  const [formData, setFormData] = useState({
    logo_url: initialSettings.logo_url || "",
    dark_logo_url: initialSettings.dark_logo_url || "",
    footer_logo_url: initialSettings.footer_logo_url || "",
    copyright_text: initialSettings.copyright_text || "© 2026 Eventic. All rights reserved.",
    primary_color: initialSettings.primary_color || "#000000",
    default_banner_url: initialSettings.default_banner_url || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePlatformBrandingSettings(formData);
      toast.success("Branding settings updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update branding settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-neutral-400" /> Platform Custom Branding
            </h2>
            <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Customize corporate logos, favicon files, and default event headers</p>
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
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Standard Light Logo URL</label>
            <input
              type="text"
              value={formData.logo_url}
              onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="/images/logo-light.svg"
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Default Event Banner URL</label>
            <input
              type="text"
              value={formData.default_banner_url}
              onChange={e => setFormData({ ...formData, default_banner_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Footer Copyright Text</label>
            <input
              type="text"
              value={formData.copyright_text}
              onChange={e => setFormData({ ...formData, copyright_text: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-wider block">Primary Corporate Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.primary_color}
                onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                className="h-10 w-12 rounded-xl border border-neutral-800 bg-neutral-900/50 p-1 cursor-pointer outline-none"
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                className="flex-1 h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Brand Preview panel */}
      <div className="border border-neutral-900 rounded-3xl p-6 bg-neutral-950/40 text-xs">
        <h3 className="font-extrabold text-white mb-4 flex items-center gap-1.5 uppercase tracking-wider text-[10px] text-neutral-400">
          <Layout className="h-4 w-4" /> Live Branding Preview
        </h3>
        <div className="border border-neutral-900 rounded-2xl overflow-hidden bg-black p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
            <span className="font-extrabold text-white text-sm">
              {formData.logo_url ? <img src={formData.logo_url} alt="Logo" className="h-5 object-contain inline-block mr-1" /> : "Eventic Logo"}
            </span>
            <div className="flex gap-3 text-[10px] text-neutral-500 font-bold">
              <span>Find Nearby Events</span>
              <span>Dashboard</span>
            </div>
          </div>

          {/* Banner preview */}
          <div className="h-28 rounded-xl bg-neutral-900 flex items-center justify-center relative overflow-hidden">
            {formData.default_banner_url ? (
              <img src={formData.default_banner_url} alt="Default Banner" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            ) : (
              <div className="text-center text-neutral-500 font-bold flex flex-col items-center gap-1">
                <ShieldAlert className="h-5 w-5 text-neutral-600" />
                <span>No Default Event Banner Set</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded-md text-[9px] font-bold text-white border border-neutral-800">
              Default Fest Template
            </div>
          </div>

          <div className="text-center text-[10px] text-neutral-550 border-t border-neutral-900 pt-3">
            {formData.copyright_text}
          </div>
        </div>
      </div>
    </div>
  );
}
