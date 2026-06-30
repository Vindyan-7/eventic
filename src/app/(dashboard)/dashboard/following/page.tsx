import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { getUserFollowedOrganizations } from "@/services/public-organizations";
import { Calendar, Users, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Following — Eventic Dashboard",
    description: "Organizations you follow on Eventic.",
};

export default async function FollowingPage() {
    await requireUser("/dashboard/following");
    const orgs = await getUserFollowedOrganizations();

    const getInitials = (name: string) =>
        name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Following</h1>
                <p className="text-muted-foreground text-sm mt-1">Organizations you follow to stay updated.</p>
            </div>

            {orgs.length === 0 ? (
                <div className="border rounded-3xl p-16 text-center space-y-4 bg-background">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Heart className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">No organizations followed yet</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Discover and follow campus organizations to get notified about upcoming events.
                        </p>
                    </div>
                    <Button asChild className="rounded-xl">
                        <Link href="/events">Explore Events</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {orgs.map((org: any) => (
                        <div key={org.id} className="flex flex-col rounded-3xl border bg-background p-5 space-y-4 hover:shadow-lg transition-all">
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 shrink-0 rounded-xl border bg-muted flex items-center justify-center overflow-hidden">
                                    {org.logo_url ? (
                                        <Image
                                            src={org.logo_url}
                                            alt={org.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="font-bold text-muted-foreground">{getInitials(org.name)}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm">{org.name}</h3>
                                </div>
                            </div>

                            <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed flex-1">
                                {org.description || "Eventic workspace organization."}
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-muted-foreground border-t pt-4">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {org.upcomingEvents} Upcoming
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    {org.followers} Followers
                                </div>
                            </div>

                            <Button asChild variant="outline" className="w-full rounded-xl h-10 gap-2 font-bold cursor-pointer">
                                <Link href={`/organizations/${org.slug}`}>
                                    View Profile <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
