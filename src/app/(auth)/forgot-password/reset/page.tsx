"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPending, setIsPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsPending(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Password updated successfully! Please login with your new password.");
                // Sign out to clear the recovery session
                await supabase.auth.signOut();
                router.push(`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update password. Please try again.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center">
                <h2 className="text-lg font-semibold">Set New Password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Please enter your new password below.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isPending}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                </Button>
            </form>
        </div>
    );
}
