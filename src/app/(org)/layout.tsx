import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { getCurrentProfile } from "@/services/profile";

export default async function OrgLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await getCurrentProfile();
    return <AppLayout role="org" profile={profile}>{children}</AppLayout>;
}

