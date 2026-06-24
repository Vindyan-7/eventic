"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPending, setIsPending] = useState(false);
    
    // Recovery states
    const [isVerifying, setIsVerifying] = useState(true);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();

        // 1. Check for query parameter errors (like expired links)
        const errorParam = searchParams.get("error");
        const errorCodeParam = searchParams.get("error_code");

        if (errorParam || errorCodeParam) {
            let msg = "The password reset link is invalid or expired.";
            if (errorCodeParam === "otp_expired" || errorParam === "access_denied") {
                msg = "The password reset link has expired or has already been used. Please request a new link.";
            }
            setVerificationError(msg);
            setIsVerifying(false);
            return;
        }

        // 2. Check for PKCE 'code' query parameter
        const codeParam = searchParams.get("code");
        if (codeParam) {
            setIsVerifying(true);
            supabase.auth.exchangeCodeForSession(codeParam)
                .then(({ error }) => {
                    if (error) {
                        setVerificationError("Failed to verify reset link: " + error.message);
                    }
                    setIsVerifying(false);
                })
                .catch((err) => {
                    setVerificationError("An unexpected error occurred during link verification.");
                    setIsVerifying(false);
                });
            return;
        }

        // 3. Check for implicit hash tokens (access_token/refresh_token) in the URL hash
        const hash = window.location.hash;
        if (hash) {
            const hashParams = new URLSearchParams(hash.substring(1));
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");

            if (accessToken && refreshToken) {
                setIsVerifying(true);
                supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                }).then(({ error }) => {
                    if (error) {
                        setVerificationError("Failed to verify access token: " + error.message);
                    }
                    setIsVerifying(false);
                }).catch(() => {
                    setVerificationError("Failed to restore auth session from link.");
                    setIsVerifying(false);
                });
                return;
            }
        }

        // 4. No parameters: verify if we already have an active authenticated session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setVerificationError("Invalid access. Please use the password reset link sent to your email.");
            }
            setIsVerifying(false);
        }).catch(() => {
            setVerificationError("Failed to check active recovery session.");
            setIsVerifying(false);
        });
    }, [searchParams]);

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
                // Sign out to cleanly terminate the recovery session
                await supabase.auth.signOut();
                router.push(`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update password. Please try again.");
        } finally {
            setIsPending(false);
        }
    };

    // Show loading scanner HUD while verifying link tokens/codes
    if (isVerifying) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Verifying recovery link...</p>
            </div>
        );
    }

    // Show friendly error message if recovery verification fails
    if (verificationError) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-950/20 p-6 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-extrabold text-red-800 dark:text-red-300">Verification Failed</h3>
                        <p className="text-sm text-red-700/80 dark:text-red-400/85 leading-relaxed">
                            {verificationError}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button asChild className="w-full">
                        <Link href={`/forgot-password${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}>
                            Request New Reset Link
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}>
                            Back to Login
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // If verified, display password reset form
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
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

                <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                </Button>
            </form>
        </div>
    );
}

export function ResetPasswordForm() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Loading reset form...</p>
            </div>
        }>
            <ResetPasswordFormContent />
        </Suspense>
    );
}
