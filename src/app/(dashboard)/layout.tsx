import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { getCurrentProfile } from "@/services/profile";
import { getUserNotifications } from "@/services/notifications";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await getCurrentProfile();
    const notifications = await getUserNotifications();
    return <AppLayout role="user" profile={profile} initialNotifications={notifications}>{children}</AppLayout>;
}
