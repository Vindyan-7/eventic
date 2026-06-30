import { getPlatformGeneralSettings } from "@/app/admin/actions";
import { requireRole } from "@/lib/admin/auth";
import { GeneralSettingsClient } from "./general-settings-client";

export default async function SettingsGeneralPage() {
  await requireRole("super_admin");
  const settings = await getPlatformGeneralSettings();

  return <GeneralSettingsClient initialSettings={settings} />;
}
