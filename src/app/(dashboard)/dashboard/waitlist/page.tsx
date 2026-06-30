import { requireUser } from "@/lib/auth";
import { getUserWaitlists } from "@/services/waitlist";
import { WaitlistPageClient } from "./waitlist-client";

export const metadata = {
    title: "My Waitlists — Eventic Dashboard",
    description: "Track your event waitlist positions and claim seats when available.",
};

export default async function WaitlistPage() {
    await requireUser("/dashboard/waitlist");
    const waitlists = await getUserWaitlists();

    return <WaitlistPageClient waitlists={waitlists as any} />;
}
