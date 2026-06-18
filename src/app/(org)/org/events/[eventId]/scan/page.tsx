import { requireOrgAdmin } from "@/lib/org-auth";
import { ScannerClient } from "./scanner-client";

export default async function ScanPage() {
    await requireOrgAdmin();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">
                    Scan Tickets
                </h1>

                <p className="text-muted-foreground">
                    Scan attendee QR codes
                </p>
            </div>

            <ScannerClient />
        </div>
    );
}