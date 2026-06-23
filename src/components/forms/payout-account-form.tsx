"use client";

import { useState, useTransition } from "react";
import { managePayoutAccount } from "@/services/payouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";

interface Props {
    organizationId: string;
    account: any;
}

export function PayoutAccountForm({ organizationId, account }: Props) {
    const [payoutType, setPayoutType] = useState(account?.payout_type || "upi");
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                await managePayoutAccount(formData);
                toast.success("Payout account updated successfully!");
            } catch (err: any) {
                toast.error(err.message || "Failed to update account");
            }
        });
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="payoutType" value={payoutType} />

            <div className="space-y-2">
                <Label>Payout Method</Label>
                <Select
                    defaultValue={payoutType}
                    onValueChange={setPayoutType}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="upi">
                            UPI
                        </SelectItem>
                        <SelectItem value="bank">
                            Bank Transfer
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {payoutType === "upi" ? (
                <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                        id="upiId"
                        name="upiId"
                        placeholder="username@bank"
                        defaultValue={account?.upi_id}
                        required
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                        <Input
                            id="accountHolderName"
                            name="accountHolderName"
                            defaultValue={account?.account_holder_name}
                            required
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name</Label>
                            <Input
                                id="bankName"
                                name="bankName"
                                defaultValue={account?.bank_name}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ifscCode">IFSC Code</Label>
                            <Input
                                id="ifscCode"
                                name="ifscCode"
                                placeholder="SBIN0001234"
                                defaultValue={account?.ifsc_code}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                            id="accountNumber"
                            name="accountNumber"
                            defaultValue={account?.account_number}
                            required
                        />
                    </div>
                </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : "Save Payout Settings"}
            </Button>
        </form>
    );
}
