"use client";

import { signUp } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";

export function RegisterForm() {
    const [state, formAction, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            return await signUp(formData);
        },
        null
    );

    return (
        <form action={formAction} className="space-y-6">
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
        </form>
    );
}

