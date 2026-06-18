"use client";

import { useState } from "react";
import { QRScanner } from "@/components/event/qr-scanner";
import { checkInAttendee } from "@/services/event-attendance";

export function ScannerClient() {
    const [message, setMessage] =
        useState("");

    async function handleScan(
        registrationId: string
    ) {
        const result =
            await checkInAttendee(
                registrationId
            );

        if (result?.error) {
            setMessage(
                result.error
            );
            return;
        }

        setMessage(
            "✅ Checked In Successfully"
        );
    }

    return (
        <div className="space-y-6">
            <QRScanner
                onScan={handleScan}
            />

            {message && (
                <div className="rounded-xl border p-4">
                    {message}
                </div>
            )}
        </div>
    );
}