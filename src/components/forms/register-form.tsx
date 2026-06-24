"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useActionState, useState, useEffect } from "react";

export function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get("redirect") || "";
    const [overrideState, setOverrideState] = useState<any>(null);

    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            setOverrideState(null);
            return await signUp(formData);
        },
        null
    );

    const displayState = overrideState !== null ? overrideState : state;

    useEffect(() => {
        if (displayState?.success && displayState?.redirectTo) {
            router.replace(displayState.redirectTo);
        }
    }, [displayState, router]);

    if (displayState?.alreadyExists) {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center">
                            An account already exists with this email. Please login using your email and password.
                        </p>
                        <div className="space-y-2">
                            <Button asChild className="w-full">
                                <Link href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}>
                                    Login
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setOverrideState({})}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="redirectTo" value={redirectPath} />

            {state?.error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                    {state.error}
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    disabled={isPending}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={isPending}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isPending}
                />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
            </Button>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                    className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
                >
                    Login
                </Link>
            </div>
        </form>
    );
}

