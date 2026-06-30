import { notFound } from "next/navigation";
import { 
    getOrganizationBySlug, 
    getOrganizationEvents, 
    getOrganizationStats,
    isFollowingOrganization,
    getFollowersCount
} from "@/services/public-organizations";
import { getEventStatus } from "@/lib/event-status";
import { OrganizationProfileHeader } from "@/components/organization/profile-header";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

// SEO and search engine indexing configurations
export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const organization = await getOrganizationBySlug(slug);
    if (!organization) return {};

    return {
        title: `${organization.name} - Organizer Profile | Eventic`,
        description: organization.description || `Discover events hosted by ${organization.name} on Eventic.`,
        openGraph: {
            title: `${organization.name} on Eventic`,
            description: organization.description || `Events directory, ticket reservations, and schedules for ${organization.name}.`,
            url: `https://eventic.co/organizations/${slug}`,
            images: organization.logo_url ? [{ url: organization.logo_url }] : [],
        }
    };
}

export default async function PublicOrganizationPage({ params }: PageProps) {
    const { slug } = await params;

    const organization = await getOrganizationBySlug(slug);
    if (!organization) {
        notFound();
    }

    const [events, stats, isFollowing, followers] = await Promise.all([
        getOrganizationEvents(organization.id),
        getOrganizationStats(organization.id),
        isFollowingOrganization(organization.id),
        getFollowersCount(organization.id),
    ]);

    // Categorize events
    const upcomingEvents = events.filter((event: any) => {
        const status = getEventStatus(event.starts_at, event.ends_at, event.status);
        return status === "Upcoming" || status === "Live";
    });

    const pastEvents = events.filter((event: any) => {
        const status = getEventStatus(event.starts_at, event.ends_at, event.status);
        return status === "Completed" || status === "Cancelled";
    });

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 space-y-12">
            <OrganizationProfileHeader
                organization={organization as any}
                initialFollowers={followers}
                initialIsFollowing={isFollowing}
                stats={stats}
                upcomingEvents={upcomingEvents}
                pastEvents={pastEvents}
            />
        </div>
    );
}
