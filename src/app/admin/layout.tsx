import { requireAdmin } from "@/lib/admin/auth";
import { AdminLayoutClient } from "./layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce security clearance on the server side
  const admin = await requireAdmin();

  return (
    <AdminLayoutClient admin={admin}>
      {children}
    </AdminLayoutClient>
  );
}
