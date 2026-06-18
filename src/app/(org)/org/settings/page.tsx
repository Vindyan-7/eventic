import { redirect } from "next/navigation";

import { requireOrgAdmin } from "@/lib/org-auth";
import { getCurrentOrganization } from "@/services/organizations";

import { OrganizationSettingsForm } from "@/components/forms/organization-settings-form";

export default async function OrganizationSettingsPage() {
    await requireOrgAdmin();

    const result =
        await getCurrentOrganization();

    if (
        result.error ||
        !result.data
    ) {
        redirect("/org");
    }

    const organization =
        result.data;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold">
                    Organization Settings
                </h1>

                <p className="text-muted-foreground mt-2">
                    Manage your organization
                    profile, branding and
                    website information.
                </p>
            </div>

            <div className="rounded-2xl border p-6">
                <OrganizationSettingsForm
                    organization={{
                        id: organization.id,
                        name: organization.name,
                        description:
                            organization.description,
                        website:
                            organization.website,
                        logo_url:
                            organization.logo_url,
                    }}
                />
            </div>
        </div>
    );
}