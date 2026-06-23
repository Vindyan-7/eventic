"use server";

import { createClient } from "@/lib/supabase/server";
import { requireOrgAdmin } from "@/lib/org-auth";
import { getEventStatus } from "@/lib/event-status";

export async function getOrganizationAnalytics() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: organization } =
        await supabase
            .from("organizations")
            .select("id")
            .eq("owner_id", user.id)
            .single();

    if (!organization) {
        return null;
    }

    const { data: events } =
        await supabase
            .from("events")
            .select(`
                id,
                title,
                starts_at,
                ends_at,
                status,
                is_paid,
                ticket_price,
                event_registrations (
                    id,
                    checked_in,
                    created_at,
                    profiles!event_registrations_user_id_fkey (
                        full_name
                    )
                )
            `)
            .eq(
                "organization_id",
                organization.id
            );

    const totalEvents =
        events?.length ?? 0;

    const totalRegistrations =
        events?.reduce(
            (acc: number, event: any) =>
                acc +
                (event.event_registrations?.length ?? 0),
            0
        ) ?? 0;

    const totalRevenue =
        events?.reduce(
            (acc: number, event: any) => {
                if (!event.is_paid)
                    return acc;

                return (
                    acc +
                    Number(event.ticket_price ?? 0) *
                    (event.event_registrations?.length ?? 0)
                );
            },
            0
        ) ?? 0;

    const totalCheckIns =
        events?.reduce(
            (acc: number, event: any) =>
                acc +
                (
                    event.event_registrations?.filter(
                        (r: any) =>
                            r.checked_in
                    ).length ?? 0
                ),
            0
        ) ?? 0;

    const attendanceRate =
        totalRegistrations === 0
            ? 0
            : Math.round(
                (totalCheckIns /
                    totalRegistrations) *
                100
            );

    const topEvents =
        [...(events ?? [])]
            .sort(
                (a: any, b: any) =>
                    (b.event_registrations?.length ?? 0) -
                    (a.event_registrations?.length ?? 0)
            )
            .slice(0, 5);

    const upcomingEvents =
        [...(events ?? [])]
            .filter(
                (event: any) =>
                    new Date(
                        event.starts_at
                    ) > new Date()
            )
            .sort(
                (a: any, b: any) =>
                    new Date(
                        a.starts_at
                    ).getTime() -
                    new Date(
                        b.starts_at
                    ).getTime()
            )
            .slice(0, 5);

    const recentRegistrations =
        (events ?? [])
            .flatMap((event: any) =>
                (event.event_registrations ?? []).map(
                    (registration: any) => ({
                        eventTitle:
                            event.title,
                        attendeeName:
                            registration.profiles
                                ?.full_name ??
                            "Unknown User",
                        created_at:
                            registration.created_at,
                    })
                )
            )
            .sort(
                (a: any, b: any) =>
                    new Date(
                        b.created_at
                    ).getTime() -
                    new Date(
                        a.created_at
                    ).getTime()
            )
            .slice(0, 10);

    const revenueByEvent = (events ?? [])
        .filter((event: any) => event.is_paid)
        .map((event: any) => ({
            id: event.id,
            title: event.title,
            revenue: Number(event.ticket_price ?? 0) * (event.event_registrations?.length ?? 0)
        }))
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

    const attendanceByEvent = (events ?? [])
        .map((event: any) => {
            const total = event.event_registrations?.length ?? 0;
            const checkedIn = event.event_registrations?.filter((r: any) => r.checked_in).length ?? 0;
            const rate = total === 0 ? 0 : (checkedIn / total) * 100;
            return {
                id: event.id,
                title: event.title,
                rate,
                checkedIn,
                total
            };
        })
        .sort((a: any, b: any) => b.rate - a.rate)
        .slice(0, 5);

    let upcomingCount = 0;
    let liveCount = 0;
    let completedCount = 0;

    events?.forEach((event: any) => {
        const status = getEventStatus(
            event.starts_at,
            event.ends_at,
            event.status
        );
        if (status === "Upcoming") {
            upcomingCount++;
        } else if (status === "Live") {
            liveCount++;
        } else if (status === "Completed") {
            completedCount++;
        }
    });

    return {
        totalEvents,
        totalRegistrations,
        totalRevenue,
        totalCheckIns,
        attendanceRate,
        topEvents,
        upcomingEvents,
        recentRegistrations,
        revenueByEvent,
        attendanceByEvent,
        upcomingCount,
        liveCount,
        completedCount,
    };
}


export async function getOrganizationEvents() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data: organization } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!organization) {
        return [];
    }

    const { data: events } = await supabase
        .from("events")
        .select(`
      *,
      event_registrations (
        id
      )
    `)
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });

    return events || [];
}