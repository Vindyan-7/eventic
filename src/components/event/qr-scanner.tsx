"use client";

import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
    onScan: (
        registrationId: string
    ) => void;
}

export function QRScanner({
    onScan,
}: Props) {
    useEffect(() => {
        const scanner =
            new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    qrbox: 250,
                },
                false
            );

        scanner.render(
            (decodedText) => {
                onScan(decodedText);
            },
            () => {}
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, [onScan]);

    return (
        <div id="qr-reader" />
    );
}