"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkInAttendee } from "@/services/event-attendance";

interface Props {
    registrationId: string;
}

export function CheckInButton({
    registrationId,
}: Props) {
    const [pending, startTransition] =
        useTransition();

    const router = useRouter();

    return (
        <button
            disabled={pending}
            onClick={() =>
                startTransition(async () => {
                    await checkInAttendee(
                        registrationId
                    );

                    router.refresh();
                })
            }
            className="rounded-lg bg-green-600 px-3 py-2 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
            {pending
                ? "Checking In..."
                : "Check In"}
        </button>
    );
}