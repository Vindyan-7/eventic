"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { checkInAttendee } from "@/services/event-attendance";
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
    registrationId: string;
}

export function CheckInButton({
    registrationId,
}: Props) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    async function handleCheckIn() {
        startTransition(async () => {
            const result = await checkInAttendee(registrationId);

            if (result?.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Attendee checked in successfully");
            router.refresh();
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button
                    disabled={pending}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                    <CheckCircle2 className="h-4 w-4" />
                    {pending ? "Checking In..." : "Check In"}
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Check-In</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to mark this attendee as checked in? This action will update the attendance record.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCheckIn} className="bg-green-600 hover:bg-green-700">
                        Confirm Check-In
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}