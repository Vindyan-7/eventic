import { requireRole } from "@/lib/admin/auth";
import { getCmsConfig } from "@/app/admin/actions";
import { CmsClient } from "./cms-client";

export default async function AdminCmsPage() {
  // Only Super Admins may edit homepage configurations
  await requireRole("super_admin");

  const config = await getCmsConfig();
  return <CmsClient initialConfig={config} />;
}
