import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { getCurrentProfile } from "@/services/profile";
import { cookies } from "next/headers";
import { logoutAllScanners } from "@/services/scan-code-actions";

export default async function OrgLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await getCurrentProfile();
    const isScanner = profile?.role === "volunteer";

    if (isScanner) {
        return (
            <div className="min-h-screen bg-muted/20 flex flex-col">
                <header className="border-b bg-background px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">
                                E
                            </span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Eventic Scanner Portal
                        </span>
                    </div>
                    <form action={logoutAllScanners}>
                        <button
                            type="submit"
                            className="text-sm font-medium hover:underline text-red-500 cursor-pointer"
                        >
                            Log out Scanner
                        </button>
                    </form>
                </header>
                <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <AppLayout role="org" profile={profile}>
            {children}
        </AppLayout>
    );
}

