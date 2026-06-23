import { requireUser } from "@/lib/auth";
import { getCurrentProfile } from "@/services/profile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function ProfilePage() {
    await requireUser("/dashboard/profile");

    const profile =
        await getCurrentProfile();

    if (!profile) {
        return (
            <div>
                Failed to load profile.
            </div>
        );
    }

    const initials =
        profile.full_name
            ?.split(" ")
            .map(
                (name: string) =>
                    name[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() ?? "U";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">
                    My Profile
                </h1>

                <p className="text-muted-foreground">
                    View your account
                    information.
                </p>
            </div>

            <div className="rounded-2xl border p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-2xl">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">
                            {profile.full_name ??
                                "User"}
                        </h2>

                        <p className="text-muted-foreground">
                            {profile.email}
                        </p>

                        <div className="inline-flex rounded-full border px-3 py-1 text-sm">
                            {profile.role ===
                            "org_admin"
                                ? "Organization Admin"
                                : "User"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border p-6">
                <h3 className="text-lg font-semibold mb-4">
                    Account Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Full Name
                        </p>

                        <p className="font-medium">
                            {profile.full_name ??
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Email
                        </p>

                        <p className="font-medium">
                            {profile.email ??
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Role
                        </p>

                        <p className="font-medium">
                            {profile.role ??
                                "-"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}