"use client";

import { useState } from "react";
import { updateFeatureFlag } from "@/app/admin/actions";
import { toast } from "sonner";
import { Flag, Save, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";

interface FeatureFlag {
  id?: string;
  flag_key: string;
  description: string;
  is_enabled: boolean;
}

export function FeatureFlagsClient({ initialFlags }: { initialFlags: FeatureFlag[] }) {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const handleToggle = async (key: string, currentStatus: boolean) => {
    setUpdatingKey(key);
    try {
      await updateFeatureFlag(key, !currentStatus);
      setFlags(prev => prev.map(f => {
        if (f.flag_key === key) {
          return { ...f, is_enabled: !currentStatus };
        }
        return f;
      }));
      toast.success(`Feature ${key} ${!currentStatus ? "enabled" : "disabled"} successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle feature flag");
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-neutral-900 pb-4">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Flag className="h-5 w-5 text-neutral-400" /> Administrative Feature Flags
        </h2>
        <p className="text-[10px] text-neutral-500 font-bold mt-0.5">Immediately toggle global platform functionalities without editing source code files</p>
      </div>

      <div className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag.flag_key}
            className="flex items-center justify-between p-4 border border-neutral-900 bg-neutral-900/10 rounded-2xl text-xs"
          >
            <div className="space-y-1 pr-4">
              <span className="font-extrabold text-white uppercase tracking-wider text-[10px] block">
                {flag.flag_key.replace(/_/g, " ")}
              </span>
              <p className="text-neutral-500 font-bold text-[10px]">{flag.description || "No description provided."}</p>
            </div>
            
            <button
              onClick={() => handleToggle(flag.flag_key, flag.is_enabled)}
              disabled={updatingKey === flag.flag_key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold border transition-all cursor-pointer ${
                flag.is_enabled
                  ? "bg-white text-black border-white hover:bg-neutral-200"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
              }`}
            >
              {flag.is_enabled ? (
                <>
                  <ToggleRight className="h-4 w-4" /> Enabled
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4" /> Disabled
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-2xl flex items-center gap-3 text-neutral-400 text-[10px] font-bold">
        <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
        <span>Toggles are synced globally across all sessions. Changes are active instantly at NextJS router middleware level.</span>
      </div>
    </div>
  );
}
