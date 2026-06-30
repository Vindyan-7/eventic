import { requireWorkspacePermission } from "@/lib/workspace-auth";
import { OrganizationSettingsForm } from "@/components/forms/organization-settings-form";

export default async function OrganizationSettingsPage() {
  const { workspace } = await requireWorkspacePermission("workspace.settings");

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans text-xs">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Workspace Settings</h1>
        <p className="text-neutral-500 font-bold mt-2">
          Manage your workspace profile, branding and website information.
        </p>
      </div>

      <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-6">
        <OrganizationSettingsForm
          organization={{
            id: workspace.id,
            name: workspace.name,
            description: workspace.description || "",
            website: workspace.website || "",
            logo_url: workspace.logo_url || "",
          }}
        />
      </div>
    </div>
  );
}