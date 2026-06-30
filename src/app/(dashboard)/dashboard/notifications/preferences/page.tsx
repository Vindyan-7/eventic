import { requireUser } from "@/lib/auth";
import { getNotificationPreferences } from "@/services/notification-service";
import { PreferencesClient } from "./preferences-client";

export const metadata = {
  title: "Notification Preferences — Eventic",
  description: "Manage your Eventic notification settings.",
};

export default async function NotificationPreferencesPage() {
  await requireUser("/dashboard/notifications/preferences");
  const prefs = await getNotificationPreferences();

  return (
    <PreferencesClient
      initialPreferences={{
        website_enabled: prefs?.website_enabled ?? true,
        email_enabled: prefs?.email_enabled ?? true,
        pref_events: prefs?.pref_events ?? true,
        pref_registrations: prefs?.pref_registrations ?? true,
        pref_workspace_invites: prefs?.pref_workspace_invites ?? true,
        pref_volunteer_invites: prefs?.pref_volunteer_invites ?? true,
        pref_certificates: prefs?.pref_certificates ?? true,
        pref_waitlist: prefs?.pref_waitlist ?? true,
        pref_platform: prefs?.pref_platform ?? true,
      }}
    />
  );
}
