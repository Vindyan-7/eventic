import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { getCurrentProfile } from "@/services/profile";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await getCurrentProfile();
    return <AppLayout role="user" profile={profile}>{children}</AppLayout>;
}

