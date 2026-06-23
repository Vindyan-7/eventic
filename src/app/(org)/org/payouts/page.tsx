

import { requireOrgAdmin } from "@/lib/org-auth";
import { getCurrentOrganization } from "@/services/organizations";
import { getPayoutData } from "@/services/payouts";
import { PayoutAccountForm } from "@/components/forms/payout-account-form";
import { RequestPayoutButton } from "@/components/payouts/request-payout-button";
import { redirect } from "next/navigation";

export default async function PayoutsPage() {
    await requireOrgAdmin("/org/payouts");

    const { data: organization } =
        await getCurrentOrganization();

    if (!organization) {
        redirect("/org");
    }

    const {
        account,
        requests,
        availableBalance,
        totalRevenue,
        platformFees,
    } = await getPayoutData(
        organization.id
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                    Payouts
                </h1>

                <p className="text-muted-foreground mt-2">
                    Manage your earnings,
                    withdrawal methods and
                    payout requests.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border p-6 bg-black text-white">
                    <p className="text-sm opacity-70">
                        Available Balance
                    </p>

                    <p className="text-3xl font-bold mt-3">
                        ₹
                        {availableBalance.toFixed(
                            2
                        )}
                    </p>

                    {availableBalance >
                        0 &&
                        account && (
                            <div className="mt-5">
                                <RequestPayoutButton
                                    organizationId={
                                        organization.id
                                    }
                                    amount={
                                        availableBalance
                                    }
                                />
                            </div>
                        )}

                    {!account &&
                        availableBalance >
                        0 && (
                            <p className="text-xs text-orange-300 mt-4">
                                Add a payout
                                account before
                                requesting a
                                withdrawal.
                            </p>
                        )}
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Total Revenue
                    </p>

                    <p className="text-3xl font-bold mt-3">
                        ₹
                        {totalRevenue.toFixed(
                            2
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border p-6">
                    <p className="text-sm text-muted-foreground">
                        Platform Fees
                    </p>

                    <p className="text-3xl font-bold mt-3">
                        ₹
                        {platformFees.toFixed(
                            2
                        )}
                    </p>
                </div>
            </div>

            {/* Account + History */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">
                        Payout Account
                    </h2>

                    <div className="rounded-2xl border p-6">
                        <PayoutAccountForm
                            organizationId={
                                organization.id
                            }
                            account={account}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">
                        Payout History
                    </h2>

                    <div className="rounded-2xl border overflow-hidden">
                        {requests.length ===
                            0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                No payout
                                requests yet.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {requests.map(
                                    (
                                        request: any
                                    ) => (
                                        <div
                                            key={
                                                request.id
                                            }
                                            className="flex items-center justify-between p-4"
                                        >
                                            <div>
                                                <p className="font-semibold">
                                                    ₹
                                                    {
                                                        request.amount
                                                    }
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        request.requested_at
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${request.status ===
                                                        "paid"
                                                        ? "bg-green-100 text-green-700"
                                                        : request.status ===
                                                            "pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {request.status.toUpperCase()}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="rounded-2xl border p-6 bg-muted/30">
                <h3 className="font-semibold mb-2">
                    How payouts work
                </h3>

                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                        • Revenue is
                        collected from paid
                        event registrations.
                    </li>

                    <li>
                        • Platform fees are
                        deducted
                        automatically.
                    </li>

                    <li>
                        • Available balance
                        can be requested for
                        payout at any time.
                    </li>

                    <li>
                        • Payout requests
                        are reviewed and
                        processed manually.
                    </li>
                </ul>
            </div>
        </div>
    );
}