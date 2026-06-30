import { getPlatformBrandingSettings } from "@/app/admin/actions";
import { requireRole } from "@/lib/admin/auth";
import { BrandingSettingsClient } from "./branding-settings-client";

export default async function SettingsBrandingPage() {
  await requireRole("super_admin");
  const settings = await getPlatformBrandingSettings();

  return <BrandingSettingsClient initialSettings={settings} />;
}
