"use client";

import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
    onScan: (
        registrationId: string
    ) => void;
}

export function QRScanner({
    onScan,
}: Props) {
    const [error, setError] =
        useState<string>("");

    const [status, setStatus] =
        useState<string>(
            "Initializing scanner..."
        );

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
                        console.log(
                            "QR DETECTED:",
                            decodedText
                        );

                        setStatus(
                            "QR Code detected"
                        );

                        onScan(
                            decodedText
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
    }, [onScan]);

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

            {error && (
                <div className="rounded-xl border border-red-500 bg-red-50 p-4 text-red-600">
                    <p className="font-medium">
                        Camera Error
                    </p>

                    <p className="text-sm">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}