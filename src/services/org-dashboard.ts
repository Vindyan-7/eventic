"use server";

import { createClient } from "@/lib/supabase/server";
import { requireOrgAdmin } from "@/lib/org-auth";
import { getEventStatus } from "@/lib/event-status";

export async function getOrganizationAnalytics(organizationId?: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    let resolvedOrgId = organizationId;

    if (!resolvedOrgId) {
        const { data: organization } =
            await supabase
                .from("organizations")
                .select("id")
                .eq("owner_id", user.id)
                .single();
        resolvedOrgId = organization?.id;
    }

    if (!resolvedOrgId) {
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
                category,
                custom_questions,
                event_registrations (
                    id,
                    checked_in,
                    checked_in_at,
                    created_at,
                    source,
                    profiles!event_registrations_user_id_fkey (
                        full_name
                    )
                )
            `)
            .eq(
                "organization_id",
                resolvedOrgId
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

    // Compute 30 days registration trend
    const trendMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        trendMap[dateStr] = 0;
    }

    events?.forEach((event: any) => {
        event.event_registrations?.forEach((reg: any) => {
            const regDate = new Date(reg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            if (regDate in trendMap) {
                trendMap[regDate]++;
            }
        });
    });

    const registrationTrend = Object.entries(trendMap).map(([date, count]) => ({
        date,
        count,
    }));

    // Compute category breakdown
    const catMap: Record<string, number> = {};
    events?.forEach((event: any) => {
        const cat = event.category || "General";
        const regCount = event.event_registrations?.length ?? 0;
        catMap[cat] = (catMap[cat] || 0) + regCount;
    });

    const categoryBreakdown = Object.entries(catMap).map(([category, count]) => ({
        category,
        count,
    }));

    // Compute weekday heatmap
    const weekdayMap: Record<string, number> = {
        "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0
    };
    events?.forEach((event: any) => {
        event.event_registrations?.forEach((reg: any) => {
            const dayName = new Date(reg.created_at).toLocaleDateString("en-US", { weekday: "short" });
            if (dayName in weekdayMap) {
                weekdayMap[dayName]++;
            }
        });
    });
    const registrationHeatmap = Object.entries(weekdayMap).map(([day, count]) => ({
        day,
        count,
    }));

    // Compute hourly check-in flow
    const flowMap: Record<string, number> = {};
    events?.forEach((event: any) => {
        event.event_registrations?.forEach((reg: any) => {
            if (reg.checked_in && reg.checked_in_at) {
                const date = new Date(reg.checked_in_at);
                const hourStr = `${String(date.getHours()).padStart(2, "0")}:00`;
                flowMap[hourStr] = (flowMap[hourStr] || 0) + 1;
            }
        });
    });
    const checkInFlow = Object.entries(flowMap)
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour.localeCompare(b.hour));

    // Compute traffic sources
    const sourceMap: Record<string, number> = {
        "instagram": 0, "whatsapp": 0, "direct": 0, "ambassador": 0, "poster": 0
    };
    events?.forEach((event: any) => {
        event.event_registrations?.forEach((reg: any) => {
            const src = (reg.source || "direct").toLowerCase();
            if (src in sourceMap) {
                sourceMap[src]++;
            } else {
                sourceMap["direct"]++;
            }
        });
    });
    const registrationSources = Object.entries(sourceMap).map(([source, count]) => ({
        source,
        count,
    }));

    // Compute average check-in speed (velocity in seconds between entry scans)
    let checkInSpeed = 0;
    const checkInTimes = events
        ?.flatMap((event: any) => event.event_registrations ?? [])
        .filter((reg: any) => reg.checked_in && reg.checked_in_at)
        .map((reg: any) => new Date(reg.checked_in_at).getTime())
        .sort((a: number, b: number) => a - b) ?? [];

    if (checkInTimes.length > 1) {
        let totalDiffSeconds = 0;
        for (let i = 1; i < checkInTimes.length; i++) {
            totalDiffSeconds += (checkInTimes[i] - checkInTimes[i - 1]) / 1000;
        }
        const avgSeconds = totalDiffSeconds / (checkInTimes.length - 1);
        checkInSpeed = Number(Math.max(1, avgSeconds).toFixed(1));
    }

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
        registrationTrend,
        categoryBreakdown,
        registrationHeatmap,
        checkInFlow,
        registrationSources,
        checkInSpeed,
    };
}


export async function getOrganizationEvents(organizationId?: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    let resolvedOrgId = organizationId;

    if (!resolvedOrgId) {
        const { data: organization } = await supabase
            .from("organizations")
            .select("id")
            .eq("owner_id", user.id)
            .single();
        resolvedOrgId = organization?.id;
    }

    if (!resolvedOrgId) {
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
        .eq("organization_id", resolvedOrgId)
        .order("created_at", { ascending: false });

    return events || [];
}