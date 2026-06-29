"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { validateScanCode } from "@/services/scan-code-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ScanLoginPage() {
    const [code, setCode] = useState("");
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!/^\d{6}$/.test(code.trim())) {
            toast.error("Code must be a 6-digit number");
            return;
        }

        startTransition(async () => {
            try {
                const res = await validateScanCode(code.trim().toUpperCase());
                if (res.error) {
                    toast.error(res.error);
                    return;
                }
                
                toast.success("Staff session verified successfully!");
                router.push(`/org/events/${res.eventId}/scan`);
            } catch (err) {
                toast.error("Failed to authenticate scanner code");
            }
        });
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-2xl space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Key className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-foreground">Staff Scanner Login</h1>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        Enter the 6-digit access code shared by the event organizer to start scanning tickets.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
                            Access Code
                        </Label>
                        <Input
                            id="code"
                            type="text"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            disabled={pending}
                            className="h-11 text-center font-mono font-bold tracking-widest text-lg rounded-xl uppercase"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={pending}
                        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer bg-black text-white hover:bg-black/90 transition-all shadow-xs"
                    >
                        {pending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Validating Code...
                            </>
                        ) : (
                            <>
                                Access Scanner
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="pt-2 text-center">
                    <button
                        onClick={() => router.push("/login")}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline transition cursor-pointer"
                    >
                        Are you an organizer? Log in here
                    </button>
                </div>

            </div>
        </div>
    );
}
