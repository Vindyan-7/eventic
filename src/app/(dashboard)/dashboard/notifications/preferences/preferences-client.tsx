"use client";

import { useState, useTransition } from "react";
import { Bell, Mail, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveNotificationPreferences } from "@/services/notification-service";
import { toast } from "sonner";
import Link from "next/link";

interface PreferencesClientProps {
  initialPreferences: {
    website_enabled: boolean;
    email_enabled: boolean;
    pref_events: boolean;
    pref_registrations: boolean;
    pref_workspace_invites: boolean;
    pref_volunteer_invites: boolean;
    pref_certificates: boolean;
    pref_waitlist: boolean;
    pref_platform: boolean;
  };
}

function Toggle({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 cursor-pointer ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function PreferenceRow({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b last:border-0">
      <div className="flex-1">
        <label htmlFor={id} className="font-bold text-sm cursor-pointer">
          {label}
        </label>
        <p className="text-muted-foreground text-xs mt-0.5">{description}</p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export function PreferencesClient({ initialPreferences }: PreferencesClientProps) {
  const [prefs, setPrefs] = useState(initialPreferences);
  const [pending, startTransition] = useTransition();

  const update = (key: keyof typeof prefs) => (value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      await saveNotificationPreferences(prefs);
      toast.success("Notification preferences saved!");
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground mb-2">
          <Link href="/dashboard/notifications">
            <ArrowLeft className="h-4 w-4" /> Back to Notifications
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground text-sm">
          Choose what you want to be notified about on Eventic.
        </p>
      </div>

      {/* Channels */}
      <div className="rounded-3xl border bg-background overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="font-extrabold text-sm uppercase tracking-wider">Notification Channels</h2>
          </div>
        </div>
        <div className="px-6">
          <PreferenceRow
            id="website_enabled"
            label="Website Notifications"
            description="Show notifications in the bell icon and Notification Center."
            checked={prefs.website_enabled}
            onChange={update("website_enabled")}
          />
          <PreferenceRow
            id="email_enabled"
            label="Email Notifications"
            description="Send important notifications to your email address (requires email setup)."
            checked={prefs.email_enabled}
            onChange={update("email_enabled")}
          />
        </div>
      </div>

      {/* Notification types */}
      <div className="rounded-3xl border bg-background overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <h2 className="font-extrabold text-sm uppercase tracking-wider">Notification Types</h2>
          </div>
        </div>
        <div className="px-6">
          <PreferenceRow
            id="pref_events"
            label="Event Updates"
            description="Event updates, cancellations, venue changes from organizers."
            checked={prefs.pref_events}
            onChange={update("pref_events")}
          />
          <PreferenceRow
            id="pref_registrations"
            label="Registration & Tickets"
            description="Registration confirmations, cancellations, and ticket details."
            checked={prefs.pref_registrations}
            onChange={update("pref_registrations")}
          />
          <PreferenceRow
            id="pref_waitlist"
            label="Waitlist Updates"
            description="Seat availability alerts, waitlist position updates, expiry reminders."
            checked={prefs.pref_waitlist}
            onChange={update("pref_waitlist")}
          />
          <PreferenceRow
            id="pref_workspace_invites"
            label="Workspace Invitations"
            description="Invitations to join organization workspaces as a team member."
            checked={prefs.pref_workspace_invites}
            onChange={update("pref_workspace_invites")}
          />
          <PreferenceRow
            id="pref_volunteer_invites"
            label="Volunteer Invitations"
            description="Invitations to volunteer at events hosted by organizations."
            checked={prefs.pref_volunteer_invites}
            onChange={update("pref_volunteer_invites")}
          />
          <PreferenceRow
            id="pref_certificates"
            label="Certificates"
            description="Alerts when your participation certificate is ready to download."
            checked={prefs.pref_certificates}
            onChange={update("pref_certificates")}
          />
          <PreferenceRow
            id="pref_platform"
            label="Platform Announcements"
            description="Important platform-wide updates, maintenance notices, and news."
            checked={prefs.pref_platform}
            onChange={update("pref_platform")}
          />
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={pending}
        className="w-full h-11 rounded-xl font-bold gap-2 cursor-pointer"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </div>
  );
}
