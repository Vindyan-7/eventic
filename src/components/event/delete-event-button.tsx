"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/services/events";

interface Props {
    eventId: string;
}

export function DeleteEventButton({
    eventId,
}: Props) {
    const [pending, startTransition] =
        useTransition();

    return (
        <button
            onClick={() => {
                const confirmed =
                    window.confirm(
                        "Are you sure you want to delete this event?"
                    );

                if (!confirmed) return;

                startTransition(() => {
                    deleteEvent(eventId);
                });
            }}
            disabled={pending}
            className="rounded-xl border border-red-500 text-red-500 px-5 py-2.5 text-sm font-medium hover:bg-red-500 hover:text-white transition-colors"
        >
            {pending
                ? "Deleting..."
                : "Delete Event"}
        </button>
    );
}