"use client";

import { useTransition } from "react";
import { requestPayout } from "@/services/payouts";
import { Button } from "@/components/ui/button";
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
    organizationId: string;
    amount: number;
}

export function RequestPayoutButton({ organizationId, amount }: Props) {
    const [isPending, startTransition] = useTransition();

    async function handleRequest() {
        startTransition(async () => {
            try {
                await requestPayout(organizationId, amount);
                toast.success("Payout requested successfully! Our team will process it soon.");
            } catch (err: any) {
                toast.error(err.message || "Failed to request payout");
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    disabled={isPending || amount <= 0}
                    variant="secondary"
                    className="w-full bg-white text-black hover:bg-gray-100"
                >
                    {isPending ? "Requesting..." : "Withdraw Funds"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Request Payout</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to request a payout of ₹{amount.toFixed(2)}? This request will be processed by our finance team.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRequest}>
                        Confirm Request
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
