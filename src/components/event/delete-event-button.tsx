"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/services/events";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
    eventId: string;
}

export function DeleteEventButton({
    eventId,
}: Props) {
    const [pending, startTransition] = useTransition();

    async function handleDelete() {
        startTransition(async () => {
            try {
                await deleteEvent(eventId);
                toast.success("Event deleted successfully");
            } catch (err: any) {
                toast.error(err.message || "Failed to delete event");
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    disabled={pending}
                    className="rounded-xl border border-red-500 text-red-500 px-5 py-2.5 text-sm font-medium hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                >
                    {pending ? "Deleting..." : "Delete Event"}
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event and all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                        Delete Event
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}