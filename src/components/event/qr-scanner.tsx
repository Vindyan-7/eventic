"use client";

import { useEffect, useState, useTransition } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanTicket } from "@/services/scan-ticket";
import { ScanResultCard } from "./scan-result-card";

interface Props {
    eventId: string;
}

export function QRScanner({
    eventId,
}: Props) {
    const [error, setError] =
        useState<string>("");

    const [status, setStatus] =
        useState<string>(
            "Initializing scanner..."
        );

    const [attendee, setAttendee] =
        useState<any>(null);

    const [isProcessing, setIsProcessing] =
        useState(false);

    const [pending, startTransition] =
        useTransition();

    useEffect(() => {
        let scanner: Html5Qrcode | null =
            null;

        async function startScanner() {
            try {
                setStatus(
                    "Checking camera access..."
                );

                if (
                    !navigator.mediaDevices ||
                    !navigator.mediaDevices
                        .getUserMedia
                ) {
                    setError(
                        "Camera API is not available in this browser."
                    );
                    return;
                }

                const stream =
                    await navigator.mediaDevices.getUserMedia(
                        {
                            video: {
                                facingMode:
                                    "environment",
                            },
                        }
                    );

                stream
                    .getTracks()
                    .forEach((track) =>
                        track.stop()
                    );

                setStatus(
                    "Starting camera..."
                );

                scanner =
                    new Html5Qrcode(
                        "qr-reader"
                    );

                await scanner.start(
                    {
                        facingMode:
                            "environment",
                    },
                    {
                        fps: 10,
                        qrbox: {
                            width: 250,
                            height: 250,
                        },
                    },
                    (
                        decodedText
                    ) => {
                        if (isProcessing) {
                            return;
                        }

                        console.log(
                            "QR DETECTED:",
                            decodedText
                        );

                        setStatus(
                            "QR Code detected"
                        );

                        setIsProcessing(true);

                        startTransition(
                            async () => {
                                const result =
                                    await scanTicket(
                                        decodedText,
                                        eventId
                                    );

                                if (
                                    "error" in result
                                ) {
                                    setError(
                                        result.error || "Verification failed"
                                    );

                                    setTimeout(() => {
                                        setIsProcessing(false);
                                    }, 2000);

                                    return;
                                }

                                setAttendee(
                                    result.attendee
                                );

                                setStatus(
                                    "Ticket verified"
                                );

                                setTimeout(() => {
                                    setIsProcessing(false);
                                }, 2000);
                            }
                        );
                    },
                    () => {
                        // Ignore scan noise
                    }
                );

                setStatus(
                    "Camera active. Scan a ticket."
                );
            } catch (err: any) {
                console.error(
                    "QR Scanner Error:",
                    err
                );

                setError(
                    err?.message ||
                    "Failed to access camera."
                );

                setStatus(
                    "Scanner failed"
                );
            }
        }

        startScanner();

        return () => {
            async function cleanup() {
                try {
                    if (
                        scanner &&
                        scanner.isScanning
                    ) {
                        await scanner.stop();
                        await scanner.clear();
                    }
                } catch (
                cleanupError
                ) {
                    console.error(
                        cleanupError
                    );
                }
            }

            cleanup();
        };
    }, [eventId]);

    return (
        <div className="space-y-4">
            <div
                id="qr-reader"
                className="w-full max-w-md overflow-hidden rounded-xl border"
            />

            <div className="rounded-xl border p-4">
                <p className="font-medium">
                    Status
                </p>

                <p className="text-sm text-muted-foreground">
                    {status}
                </p>
            </div>

            {(attendee || error) && (
                <button
                    onClick={() => {
                        setAttendee(null);
                        setError("");
                        setStatus("Camera active. Scan a ticket.");
                        setIsProcessing(false);
                    }}
                    className="w-full rounded-xl bg-black text-white px-6 py-3 font-semibold hover:bg-black/90 transition-colors"
                >
                    Scan Next Ticket
                </button>
            )}

            {attendee && (
                <ScanResultCard
                    attendee={attendee}
                />
            )}

            {error && (
                <div className="rounded-xl border border-red-500 bg-red-50 p-4 text-red-600">
                    <p className="font-medium">
                        Verification Error
                    </p>

                    <p className="text-sm">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}   