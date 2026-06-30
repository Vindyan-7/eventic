"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { validateScanCode } from "@/services/scan-code-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, Loader2, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";

export default function ScanLoginPage() {
    const [code, setCode] = useState("");
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!/^\d{6}$/.test(code.trim())) {
            toast.error("Access Code must be a 6-digit number");
            return;
        }

        startTransition(async () => {
            try {
                const res = await validateScanCode(code.trim().toUpperCase());
                if (res.error) {
                    toast.error(res.error);
                    return;
                }
                
                toast.success("Volunteer session verified successfully!");
                router.push(`/org/events/${res.eventId}/scan`);
            } catch (err) {
                toast.error("Failed to authenticate volunteer access code");
            }
        });
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 font-sans text-xs">
            <div className="w-full max-w-md rounded-3xl border border-neutral-900 bg-neutral-950 p-8 shadow-2xl space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center">
                        <Key className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">Volunteer Login</h1>
                    <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                        Access the volunteer portal to scan tickets and manage event check-ins.
                    </p>
                </div>

                {/* Option 1: Registered Volunteers */}
                <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1">
                        Registered Volunteers
                    </Label>
                    <Button
                        onClick={() => router.push("/login?redirect=/dashboard/profile")}
                        className="w-full h-11 border border-neutral-850 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                        <User className="h-4 w-4" />
                        Continue with Eventic Account
                    </Button>
                </div>

                <div className="relative flex items-center justify-between my-4">
                    <span className="h-px bg-neutral-900 flex-grow" />
                    <span className="mx-3 text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest">OR</span>
                    <span className="h-px bg-neutral-900 flex-grow" />
                </div>

                {/* Option 2: Temporary Volunteers */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code" className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1">
                            Enter Volunteer Access Code
                        </Label>
                        <Input
                            id="code"
                            type="text"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            disabled={pending}
                            className="h-11 text-center font-mono font-bold tracking-widest text-lg rounded-xl border border-neutral-900 bg-neutral-950 text-white uppercase outline-none focus:border-neutral-700"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={pending}
                        className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer bg-white text-black hover:bg-neutral-200 transition-all shadow-xs"
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

                <div className="pt-2 text-center border-t border-neutral-900">
                    <button
                        onClick={() => router.push("/login")}
                        className="text-xs text-neutral-500 hover:text-white hover:underline transition cursor-pointer"
                    >
                        Are you an organizer? Log in here
                    </button>
                </div>

            </div>
        </div>
    );
}
