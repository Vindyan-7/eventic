"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function getOrganizationBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        return null;
    }
    return data;
}

export async function getOrganizationEvents(organizationId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("events")
        .select(`
            *,
            organizations (
                name,
                slug,
                logo_url
            ),
            event_registrations (
                id,
                checked_in
            )
        `)
        .eq("organization_id", organizationId)
        .neq("status", "draft")
        .order("starts_at", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export async function getOrganizationStats(organizationId: string) {
    const events = await getOrganizationEvents(organizationId);

    const now = new Date();
    let totalRegistrations = 0;
    let totalCheckins = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    events.forEach((event: any) => {
        const regs = event.event_registrations || [];
        totalRegistrations += regs.length;
        totalCheckins += regs.filter((r: any) => r.checked_in).length;

        const startsAt = new Date(event.starts_at);
        const endsAt = event.ends_at ? new Date(event.ends_at) : startsAt;

        if (startsAt > now) {
            upcomingCount++;
        } else if (endsAt < now || event.status === "completed") {
            completedCount++;
        }
    });

    const attendanceRate = totalRegistrations === 0
        ? 0
        : Math.round((totalCheckins / totalRegistrations) * 100);

    return {
        totalEvents: events.length,
        totalRegistrations,
        upcomingEvents: upcomingCount,
        completedEvents: completedCount,
        attendanceRate,
    };
}

// Follow/Unfollow Actions
export async function isFollowingOrganization(orgId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from("organization_follows")
        .select("id")
        .eq("user_id", user.id)
        .eq("organization_id", orgId)
        .maybeSingle();

    return !!data;
}

export async function followOrganization(orgId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Please log in to follow organizations" };

    const { error } = await supabase
        .from("organization_follows")
        .insert({
            user_id: user.id,
            organization_id: orgId
        });

    if (error) return { error: error.message };
    return { success: true };
}

export async function unfollowOrganization(orgId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from("organization_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("organization_id", orgId);

    if (error) return { error: error.message };
    return { success: true };
}

export async function getFollowersCount(orgId: string): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from("organization_follows")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId);

    if (error) return 0;
    return count ?? 0;
}

// Landing Page lists
export async function getFeaturedOrganizations() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("organizations")
        .select(`
            *,
            events (
                id,
                status
            )
        `)
        .eq("verification_status", "approved")
        .limit(6);

    if (error) return [];
    
    // Add follower counts and upcoming events count
    return Promise.all((data || []).map(async (org: any) => {
        const followers = await getFollowersCount(org.id);
        const upcomingEvents = (org.events || []).filter((e: any) => e.status === "published").length;
        return {
            ...org,
            followers,
            upcomingEvents
        };
    }));
}

export async function getTrendingOrganizations() {
    const supabase = await createClient();
    // Query follows count
    const { data: follows, error: followsError } = await supabase
        .from("organization_follows")
        .select("organization_id");

    if (followsError || !follows) return [];

    // Group follows count in memory
    const counts: Record<string, number> = {};
    follows.forEach(f => {
        counts[f.organization_id] = (counts[f.organization_id] || 0) + 1;
    });

    const sortedIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 6);
    if (sortedIds.length === 0) {
        // Fallback to featured
        return getFeaturedOrganizations();
    }

    const { data, error } = await supabase
        .from("organizations")
        .select(`
            *,
            events (
                id,
                status
            )
        `)
        .in("id", sortedIds);

    if (error || !data) return [];

    return Promise.all(data.map(async (org: any) => {
        const followers = counts[org.id] || 0;
        const upcomingEvents = (org.events || []).filter((e: any) => e.status === "published").length;
        return {
            ...org,
            followers,
            upcomingEvents
        };
    }));
}

export async function getRecentlyActiveOrganizations() {
    const supabase = await createClient();
    // Get events sorted by created_at
    const { data: recentEvents, error: eventsError } = await supabase
        .from("events")
        .select("organization_id")
        .order("created_at", { ascending: false })
        .limit(20);

    if (eventsError || !recentEvents) return [];

    const uniqueOrgIds = Array.from(new Set(recentEvents.map(e => e.organization_id))).slice(0, 6);
    if (uniqueOrgIds.length === 0) {
        return getFeaturedOrganizations();
    }

    const { data, error } = await supabase
        .from("organizations")
        .select(`
            *,
            events (
                id,
                status
            )
        `)
        .in("id", uniqueOrgIds);

    if (error || !data) return [];

    return Promise.all(data.map(async (org: any) => {
        const followers = await getFollowersCount(org.id);
        const upcomingEvents = (org.events || []).filter((e: any) => e.status === "published").length;
        return {
            ...org,
            followers,
            upcomingEvents
        };
    }));
}

export async function getUserFollowedOrganizations() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("organization_follows")
        .select(`
            organization:organization_id (
                id,
                name,
                slug,
                description,
                logo_url
            )
        `)
        .eq("user_id", user.id);

    if (error || !data) return [];

    return Promise.all((data as any[]).map(async (item: any) => {
        const org = item.organization;
        const followers = await getFollowersCount(org.id);
        // Load upcoming event count
        const { count } = await supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", org.id)
            .eq("status", "published");

        return {
            ...org,
            followers,
            upcomingEvents: count || 0
        };
    }));
}
