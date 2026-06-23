"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPayoutData(organizationId: string) {
    const supabase = await createClient();

    const { data: account } = await supabase
        .from("payout_accounts")
        .select("*")
        .eq("organization_id", organizationId)
        .maybeSingle();

    const { data: requests } = await supabase
        .from("payout_requests")
        .select("*")
        .eq("organization_id", organizationId)
        .order("requested_at", { ascending: false });

    // Calculate pending balance (Simplified)
    // In a real app, you'd calculate this from successful payments minus platform fees minus payouts already paid
    const { data: payments } = await supabase
        .from("payments")
        .select(`
            amount,
            status,
            events (
                organization_id
            )
        `)
        .eq("status", "paid");

    const orgPayments = payments?.filter((p: any) => p.events.organization_id === organizationId) ?? [];
    const totalRevenue = orgPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Get platform settings to calculate fees
    const { data: settings } = await supabase.from("platform_settings").select("*").single();

    const percentageFee = settings?.percentage_fee ?? 10;
    const fixedFee = settings?.fixed_fee_per_ticket ?? 5;

    // This balance calculation is very basic and likely needs more logic in a real production app
    // e.g. total_revenue - fees - sum(payouts)
    const platformFees = totalRevenue * (percentageFee / 100) + (orgPayments.length * fixedFee);
    const netRevenue = totalRevenue - platformFees;

    const totalPaid = requests?.filter(r => r.status === "paid").reduce((acc, curr) => acc + Number(curr.amount), 0) ?? 0;
    const availableBalance = Math.max(0, netRevenue - totalPaid);

    return {
        account,
        requests: requests ?? [],
        availableBalance,
        totalRevenue,
        netRevenue,
        platformFees
    };
}

export async function managePayoutAccount(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const organizationId = formData.get("organizationId") as string;
    const payoutType = formData.get("payoutType") as string;

    const data: any = {
        organization_id: organizationId,
        payout_type: payoutType,
        updated_at: new Date().toISOString(),
    };

    if (payoutType === "upi") {
        data.upi_id = formData.get("upiId");
    } else {
        data.account_holder_name = formData.get("accountHolderName");
        data.bank_name = formData.get("bankName");
        data.account_number = formData.get("accountNumber");
        data.ifsc_code = formData.get("ifscCode");
    }

    const { error } = await supabase
        .from("payout_accounts")
        .upsert(data, { onConflict: "organization_id" });

    if (error) throw new Error(error.message);

    revalidatePath("/org/payouts");
    return { success: true };
}

export async function requestPayout(organizationId: string, amount: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("payout_requests")
        .insert({
            organization_id: organizationId,
            amount: amount,
            status: "pending"
        });

    if (error) throw new Error(error.message);

    revalidatePath("/org/payouts");
    return { success: true };
}
