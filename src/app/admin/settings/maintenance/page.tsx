import { requireRole } from "@/lib/admin/auth";
import { getMaintenanceSettings } from "@/app/admin/actions";
import { MaintenanceClient } from "./maintenance-client";

export default async function AdminMaintenanceSettingsPage() {
  // Only Super Admins may configure Platform maintenance locks
  await requireRole("super_admin");

  const settings = await getMaintenanceSettings();
  return <MaintenanceClient initialSettings={settings} />;
}
