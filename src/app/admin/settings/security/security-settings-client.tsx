"use client";

import { useState } from "react";
import { updatePlatformSecuritySettings } from "@/app/admin/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Shield, Save, CheckCircle, HelpCircle } from "lucide-react";

export function SecuritySettingsClient({ initialSettings }: { initialSettings: any }) {
  const [formData, setFormData] = useState({
    min_password_length: initialSettings.min_password_length || 8,
    require_uppercase: initialSettings.require_uppercase ?? true,
    require_number: initialSettings.require_number ?? true,
    require_symbol: initialSettings.require_symbol ?? false,
    session_timeout: initialSettings.session_timeout || 120,
    max_login_attempts: initialSettings.max_login_attempts || 5,
    lockout_duration: initialSettings.lockout_duration || 15
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePlatformSecuritySettings(formData);
      toast.success("Security policies updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update security policies");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-neutral-400" /> Platform Security & Policies
          </h2>
          <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Manage password requirements, lockout configurations, and session timers</p>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-9 px-3.5 text-xs"
        >
          <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Policies"}
        </Button>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 text-xs">
        {/* Password Strength Constraints */}
        <div className="space-y-4 bg-neutral-900/10 border border-neutral-900 p-5 rounded-3xl">
          <h3 className="font-extrabold text-white text-[10px] uppercase tracking-wider text-neutral-400">Password Strength Rules</h3>
          
          <div className="space-y-2">
            <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Minimum Length</label>
            <input
              type="number"
              value={formData.min_password_length}
              onChange={e => setFormData({ ...formData, min_password_length: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_uppercase}
                onChange={e => setFormData({ ...formData, require_uppercase: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-800 bg-neutral-900 text-black focus:ring-0 cursor-pointer"
              />
              <span className="text-neutral-300 font-bold">Require Uppercase Character</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_number}
                onChange={e => setFormData({ ...formData, require_number: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-800 bg-neutral-900 text-black focus:ring-0 cursor-pointer"
              />
              <span className="text-neutral-300 font-bold">Require Number / Digit</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_symbol}
                onChange={e => setFormData({ ...formData, require_symbol: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-800 bg-neutral-900 text-black focus:ring-0 cursor-pointer"
              />
              <span className="text-neutral-300 font-bold">Require Special Symbol (!@#$)</span>
            </label>
          </div>
        </div>

        {/* Lockout & Expiry Configs */}
        <div className="space-y-4 bg-neutral-900/10 border border-neutral-900 p-5 rounded-3xl">
          <h3 className="font-extrabold text-white text-[10px] uppercase tracking-wider text-neutral-400">Lockout & Session Timers</h3>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Session Expiration Timeout (Minutes)</label>
            <input
              type="number"
              value={formData.session_timeout}
              onChange={e => setFormData({ ...formData, session_timeout: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Maximum Login Attempts Allowed</label>
            <input
              type="number"
              value={formData.max_login_attempts}
              onChange={e => setFormData({ ...formData, max_login_attempts: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider block">Account Temporary Lockout Duration (Minutes)</label>
            <input
              type="number"
              value={formData.lockout_duration}
              onChange={e => setFormData({ ...formData, lockout_duration: Number(e.target.value) })}
              className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900/50 text-white outline-none focus:border-neutral-700"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl flex items-center gap-3 text-neutral-400 text-[10px] font-bold">
        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
        <span>Authentication constraints are enforced at registration validation. Session controls are synced with cookies lifetime settings.</span>
      </div>
    </form>
  );
}
