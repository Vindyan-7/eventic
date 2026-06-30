"use client";

import { useState, useEffect } from "react";
import { generateScanCode, getActiveScanCode } from "@/services/scan-code-actions";
import { Key, Copy, Check, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
    eventId: string;
}

export function ScanCodeGenerator({ eventId }: Props) {
    const [code, setCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function loadCode() {
            try {
                const res = await getActiveScanCode(eventId);
                if (res) {
                    setCode(res.code);
                    setExpiresAt(res.expires_at);
                }
            } catch (e) {
                console.error("Failed to load active volunteer code", e);
            } finally {
                setLoading(false);
            }
        }
        loadCode();
    }, [eventId]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await generateScanCode(eventId);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            if (res.code && res.expiresAt) {
                setCode(res.code);
                setExpiresAt(res.expiresAt);
                toast.success("Volunteer access code generated!");
            }
        } catch (err) {
            toast.error("Failed to generate volunteer code");
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!code) return;
        
        const shareText = `Event Volunteer Access Code: ${code}\nLog in here: ${window.location.origin}/login/scan`;
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        toast.success("Volunteer access code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="rounded-2xl border p-6 bg-card flex justify-center items-center h-28">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border p-6 bg-card space-y-4">
            <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Volunteer Access Code</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
                Generate a temporary 6-digit access code for temporary volunteers. Volunteers can enter this code to check in attendees without needing a full organizer account.
            </p>

            {code ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between bg-muted/50 p-4 rounded-xl border">
                        <span className="font-mono text-xl font-extrabold tracking-wider text-foreground">
                            {code}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopy}
                                className="p-2 bg-background border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all cursor-pointer"
                                title="Copy access credentials"
                            >
                                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pl-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                            Expires: {new Date(expiresAt!).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })}
                        </span>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                            {generating ? "Regenerating..." : "Regenerate code"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-black/90 text-white px-4 py-2.5 text-sm font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                Generate Access Code
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
