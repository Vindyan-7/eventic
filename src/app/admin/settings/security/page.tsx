import { getPlatformSecuritySettings } from "@/app/admin/actions";
import { requireRole } from "@/lib/admin/auth";
import { SecuritySettingsClient } from "./security-settings-client";

export default async function SettingsSecurityPage() {
  await requireRole("super_admin");
  const settings = await getPlatformSecuritySettings();

  return <SecuritySettingsClient initialSettings={settings} />;
}
