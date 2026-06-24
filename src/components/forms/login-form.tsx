"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "";

    const [state, formAction, isPending] =
        useActionState(
            async (
                prevState: any,
                formData: FormData
            ) => {
                const result =
                    await signIn(
                        formData
                    );

                return result;
            },
            null
        );

    useEffect(() => {
        if (state?.success && state?.redirectTo) {
            router.replace(state.redirectTo);
        }
    }, [state, router]);

    return (
        <form
            action={formAction}
            className="space-y-6"
        >
            <input type="hidden" name="redirectTo" value={redirectPath} />

            {state?.error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                    {state.error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isPending}
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href={`/forgot-password${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                        className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
                    >
                        Forgot Password?
                    </Link>
                </div>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isPending}
                />
            </div>

            <Button
                type="submit"
                className="w-full"
                disabled={isPending}
            >
                {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                Login
            </Button>

            <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                    href={`/register${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                    className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
                >
                    Create Account
                </Link>
            </div>
        </form>
    );
}