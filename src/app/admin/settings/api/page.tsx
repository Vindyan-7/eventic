import { getPlatformAPIKeys } from "@/app/admin/actions";
import { requireRole } from "@/lib/admin/auth";
import { APIKeysClient } from "./api-keys-client";

export default async function SettingsAPIKeysPage() {
  await requireRole("super_admin");
  const apiKeys = await getPlatformAPIKeys();

  return <APIKeysClient initialKeys={apiKeys} />;
}
