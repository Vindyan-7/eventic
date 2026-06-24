"use client";

import { useEffect, useState, useTransition } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { scanTicket } from "@/services/scan-ticket";
import { scanAndCheckIn } from "@/services/scan-and-checkin";
import { ScanResultCard } from "./scan-result-card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Camera, RefreshCw } from "lucide-react";

interface Props {
    eventId: string;
}

export function QRScanner({
    eventId,
}: Props) {
    const [scannerMode, setScannerMode] = useState<"auto" | "verify">("auto");
    const [error, setError] = useState<string>("");
    const [status, setStatus] = useState<string>("Initializing scanner...");
    const [attendee, setAttendee] = useState<any>(null);
    const [scanResult, setScanResult] = useState<{
        checkedIn: boolean;
        checkedInAt: string | null;
        alreadyCheckedIn: boolean;
    } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pending, startTransition] = useTransition();

    // 1. Load persisted mode from localStorage on mount (hydration safe)
    useEffect(() => {
        const savedMode = localStorage.getItem("scanner-mode");
        if (savedMode === "verify" || savedMode === "auto") {
            setScannerMode(savedMode);
        }
    }, []);

    const handleModeChange = (mode: "auto" | "verify") => {
        setScannerMode(mode);
        localStorage.setItem("scanner-mode", mode);
        // Clear current states on mode toggle
        setAttendee(null);
        setScanResult(null);
        setError("");
        setStatus("Camera active. Scan a ticket.");
        setIsProcessing(false);
    };

    // 2. Scanner execution hook
    useEffect(() => {
        let scanner: Html5Qrcode | null = null;

        async function startScanner() {
            try {
                setStatus("Checking camera access...");

                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    setError("Camera API is not available in this browser.");
                    return;
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });

                stream.getTracks().forEach((track) => track.stop());

                setStatus("Starting camera...");
                scanner = new Html5Qrcode("qr-reader");

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: {
                            width: 250,
                            height: 250,
                        },
                    },
                    (decodedText) => {
                        // Prevent multi-triggering
                        if (isProcessing) return;
                        setIsProcessing(true);
                        setStatus("QR Code detected");

                        startTransition(async () => {
                            let result;
                            if (scannerMode === "auto") {
                                result = await scanAndCheckIn(decodedText, eventId);
                            } else {
                                result = await scanTicket(decodedText, eventId);
                            }

                            if ("error" in result) {
                                setError(result.error || "Verification failed");
                                setStatus("Verification failed");
                                // Auto reset scanner error state after 2.5 seconds
                                setTimeout(() => {
                                    setError("");
                                    setStatus("Camera active. Scan a ticket.");
                                    setIsProcessing(false);
                                }, 2500);
                                return;
                            }

                            setAttendee(result.attendee);
                            setScanResult({
                                checkedIn: result.checkedIn ?? false,
                                checkedInAt: result.checkedInAt ?? null,
                                alreadyCheckedIn: result.alreadyCheckedIn ?? false,
                            });
                            setStatus(result.alreadyCheckedIn ? "Already checked in" : "Check-in successful");

                            // If auto mode, trigger automatic screen reset after 2 seconds
                            if (scannerMode === "auto") {
                                setTimeout(() => {
                                    setAttendee(null);
                                    setScanResult(null);
                                    setError("");
                                    setStatus("Camera active. Scan a ticket.");
                                    setIsProcessing(false);
                                }, 2000);
                            } else {
                                // In verify mode, let processing trigger reset after 2 seconds, but keep attendee on-screen
                                setTimeout(() => {
                                    setIsProcessing(false);
                                }, 2000);
                            }
                        });
                    },
                    () => {
                        // Ignore scanner scan noise
                    }
                );

                setStatus("Camera active. Scan a ticket.");
            } catch (err: any) {
                console.error("QR Scanner Error:", err);
                setError(err?.message || "Failed to access camera.");
                setStatus("Scanner failed");
            }
        }

        startScanner();

        return () => {
            async function cleanup() {
                try {
                    if (scanner && scanner.isScanning) {
                        await scanner.stop();
                        await scanner.clear();
                    }
                } catch (cleanupError) {
                    console.error(cleanupError);
                }
            }
            cleanup();
        };
    }, [eventId, scannerMode, isProcessing]);

    const handleManualReset = () => {
        setAttendee(null);
        setScanResult(null);
        setError("");
        setStatus("Camera active. Scan a ticket.");
        setIsProcessing(false);
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            {/* Mode Selector using RadioGroup */}
            <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Scanner Mode
                </span>
                
                <RadioGroup
                    value={scannerMode}
                    onValueChange={(val: "auto" | "verify") => handleModeChange(val)}
                    className="grid grid-cols-1 gap-3"
                >
                    <div 
                        onClick={() => handleModeChange("auto")}
                        className={`flex items-start gap-3 rounded-2xl border p-4 bg-card hover:bg-muted/30 cursor-pointer transition-all ${
                            scannerMode === "auto" ? "border-primary/40 ring-1 ring-primary/20" : "border-border/60"
                        }`}
                    >
                        <RadioGroupItem value="auto" id="mode-auto" className="mt-1 cursor-pointer" />
                        <Label htmlFor="mode-auto" className="flex flex-col gap-1 cursor-pointer w-full">
                            <span className="font-extrabold text-sm text-foreground">Auto Check-In</span>
                            <span className="text-xs text-muted-foreground font-normal">Best for large events</span>
                        </Label>
                    </div>
                    
                    <div 
                        onClick={() => handleModeChange("verify")}
                        className={`flex items-start gap-3 rounded-2xl border p-4 bg-card hover:bg-muted/30 cursor-pointer transition-all ${
                            scannerMode === "verify" ? "border-primary/40 ring-1 ring-primary/20" : "border-border/60"
                        }`}
                    >
                        <RadioGroupItem value="verify" id="mode-verify" className="mt-1 cursor-pointer" />
                        <Label htmlFor="mode-verify" className="flex flex-col gap-1 cursor-pointer w-full">
                            <span className="font-extrabold text-sm text-foreground">Verify Ticket</span>
                            <span className="text-xs text-muted-foreground font-normal">Review attendee before entry</span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* QR Stream Reader viewport */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-black aspect-square max-w-md">
                <div id="qr-reader" className="w-full h-full object-cover" />
                {/* Visual Scanner HUD guide */}
                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
                    <div className="w-[180px] h-[180px] border-2 border-dashed border-primary/60 rounded-xl relative">
                        <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-4 border-l-4 border-primary" />
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-4 border-r-4 border-primary" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-4 border-l-4 border-primary" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-4 border-r-4 border-primary" />
                    </div>
                </div>
            </div>

            {/* Status Indicator */}
            <div className="rounded-2xl border p-4 bg-card flex items-center justify-between">
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Camera className="h-3 w-3" /> Status
                    </p>
                    <p className="text-sm font-semibold">{status}</p>
                </div>
                {(attendee || error) && (
                    <button
                        onClick={handleManualReset}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        title="Reset Scanner"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Scanner Manual Scan next Button for Verify Mode */}
            {scannerMode === "verify" && (attendee || error) && (
                <button
                    onClick={handleManualReset}
                    className="w-full rounded-2xl bg-black text-white px-6 py-3.5 font-bold hover:bg-black/90 transition-colors shadow-sm cursor-pointer"
                >
                    Scan Next Ticket
                </button>
            )}

            {/* Success ScanResultCard */}
            {attendee && scanResult && (
                <ScanResultCard
                    attendee={attendee}
                    checkedIn={scanResult.checkedIn}
                    checkedInAt={scanResult.checkedInAt}
                    alreadyCheckedIn={scanResult.alreadyCheckedIn}
                    onCheckInSuccess={(time) => {
                        setScanResult((prev: any) => {
                            if (!prev) return null;
                            return {
                                ...prev,
                                checkedIn: true,
                                checkedInAt: time,
                                alreadyCheckedIn: false,
                            };
                        });
                        setStatus("Check-in successful");
                    }}
                />
            )}

            {/* Red Error status block */}
            {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-950/20 p-4 text-red-600 dark:text-red-400 flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-sm">Scanner Error</p>
                        <p className="text-xs opacity-90">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}