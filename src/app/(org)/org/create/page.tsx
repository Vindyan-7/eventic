import { createOrganization } from "@/services/organizations";
import { requireUser } from "@/lib/auth";

export default async function CreateOrganizationPage() {
    await requireUser("/org/create");
    return (
        <div className="max-w-2xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">
                Create Organization
            </h1>

            <form
                action={createOrganization}
                className="space-y-6"
            >
                <div>
                    <label className="block mb-2 text-sm font-medium">
                        Organization Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        required
                        className="w-full rounded-lg border p-3"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium">
                        Description
                    </label>

                    <textarea
                        name="description"
                        rows={4}
                        className="w-full rounded-lg border p-3"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium">
                        Website
                    </label>

                    <input
                        type="url"
                        name="website"
                        className="w-full rounded-lg border p-3"
                    />
                </div>

                <button
                    type="submit"
                    className="rounded-lg bg-black text-white px-6 py-3"
                >
                    Create Organization
                </button>
            </form>
        </div>
    );
}
