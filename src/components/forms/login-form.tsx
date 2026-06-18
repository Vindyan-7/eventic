"use client";

import { signIn } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";

export function LoginForm() {
    const [state, formAction, isPending] =
        useActionState(
            async (
                prevState: any,
                formData: FormData
            ) => {
                alert("FORM SUBMITTED");

                const result =
                    await signIn(
                        formData
                    );

                alert(
                    "SIGNIN RETURNED"
                );

                return result;
            },
            null
        );

    return (
        <form
            action={formAction}
            className="space-y-6"
        >
            {state?.error && (
                <div className="p-3 rounded-lg border">
                    {state.error}
                </div>
            )}

            <div>
                <Label>Email</Label>

                <Input
                    name="email"
                    type="email"
                    required
                />
            </div>

            <div>
                <Label>Password</Label>

                <Input
                    name="password"
                    type="password"
                    required
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
        </form>
    );
}