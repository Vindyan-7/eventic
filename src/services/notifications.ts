"use server";

import { createClient } from "@/lib/supabase/server";

export async function getUserNotifications() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error || !data) return [];
    return data;
}

export async function markNotificationRead(notificationId: string) {
    const supabase = await createClient();
    await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
}

export async function markAllNotificationsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
}
