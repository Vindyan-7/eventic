import { getPlatformFeatureFlags } from "@/app/admin/actions";
import { requireRole } from "@/lib/admin/auth";
import { FeatureFlagsClient } from "./feature-flags-client";

export default async function SettingsFeatureFlagsPage() {
  await requireRole("super_admin");
  const flags = await getPlatformFeatureFlags();

  return <FeatureFlagsClient initialFlags={flags} />;
}
