import { requireWorkspacePermission } from "@/lib/workspace-auth";

export default async function PayoutsPage() {
  await requireWorkspacePermission("finance.payouts");

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10 font-sans text-xs">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Payouts</h1>
        <p className="text-neutral-500 font-bold mt-2">
          Manage your earnings, withdrawal methods and payout requests.
        </p>
      </div>

      <div className="rounded-3xl border border-neutral-900 bg-neutral-900/10 p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Paid Features Coming Soon</h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            Payouts and paid ticketing features are currently locked. As an organizer, you can create and manage free events. Payout management will be enabled in a future release.
          </p>
        </div>

        <div className="mt-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Feature coming soon
          </span>
        </div>
      </div>
    </div>
  );
}