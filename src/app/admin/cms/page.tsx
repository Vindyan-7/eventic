import { AdminHeader, AdminEmptyState } from "@/components/admin/ui";
import { requireRole } from "@/lib/admin/auth";
import { FileText } from "lucide-react";

export default async function CmsPage() {
  await requireRole(["super_admin", "platform_admin"]);

  return (
    <div className="space-y-6 font-sans">
      <AdminHeader
        title="CMS & Editorial Content"
        description="Manage landing page content, FAQs, and newsletters"
      />
      
      <AdminEmptyState
        title="Placeholder Module"
        description="Static copy updates and blog publishing tools will be implemented in the next sprint."
        icon={FileText}
      />
    </div>
  );
}
