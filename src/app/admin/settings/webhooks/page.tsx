import { getPlatformWebhooks } from "@/app/admin/actions";
import { requireRole } from "@/lib/admin/auth";
import { WebhooksClient } from "./webhooks-client";

export default async function SettingsWebhooksPage() {
  await requireRole("super_admin");
  const webhooks = await getPlatformWebhooks();

  return <WebhooksClient initialWebhooks={webhooks} />;
}
