import { getPlatformSMTPSettings, getPlatformEmailTemplates } from "@/app/admin/actions";
import { requireRole } from "@/lib/admin/auth";
import { EmailSettingsClient } from "./email-settings-client";

export default async function SettingsEmailPage() {
  await requireRole("super_admin");
  const smtp = await getPlatformSMTPSettings();
  const templates = await getPlatformEmailTemplates();

  return <EmailSettingsClient initialSmtp={smtp} initialTemplates={templates} />;
}
