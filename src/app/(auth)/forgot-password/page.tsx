"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "";

    const [email, setEmail] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        try {
            const supabase = createClient();
            const redirectToUrl = `${window.location.origin}/forgot-password/reset${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`;
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectToUrl,
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Password reset email sent! Please check your inbox.");
                setSubmitted(true);
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsPending(false);
        }
    };

    if (submitted) {
        return (
            <div className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/10 text-primary text-sm border border-primary/20 text-center animate-in fade-in duration-200">
                    We've sent a password reset link to <strong className="font-semibold">{email}</strong>.
                    Please check your email and follow the instructions to reset your password.
                </div>
                <Button asChild className="w-full">
                    <Link href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}>
                        Back to Login
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-lg font-semibold">Reset Password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Enter your email address and we'll send you a recovery link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isPending}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground mt-4">
                <Link
                    href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                    className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
