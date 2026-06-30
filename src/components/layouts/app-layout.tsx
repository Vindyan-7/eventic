"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppLayoutProps {
    children: React.ReactNode;
    role: "user" | "org";
    profile: any;
    initialNotifications?: any[];
}

export function AppLayout({ children, role, profile, initialNotifications = [] }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen bg-muted/20">
            <Sidebar
                profile={profile}
                initialNotifications={initialNotifications}
                className="hidden md:flex w-64 border-r bg-background sticky top-0 h-screen"
            />
            <div className="flex-1 flex flex-col">
                <Header role={role} profile={profile} initialNotifications={initialNotifications} />
                <main className="flex-1 p-4 md:p-8 md:pt-6">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
