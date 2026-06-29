"use client";

import { useRouter } from "next/navigation";
import { adminSignIn } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import Link from "next/link";

export function AdminLoginForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await adminSignIn(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      router.replace(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 animate-in fade-in slide-in-from-top-1">
          {state.error}
        </div>
      )}

      <div className="space-y-2 animate-in fade-in duration-300">
        <Label htmlFor="email" className="text-neutral-300 font-bold">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@eventic.local"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2 animate-in fade-in duration-350">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-neutral-300 font-bold">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
        />
      </div>

      <div className="flex items-center space-x-2 animate-in fade-in duration-400">
        <Checkbox id="remember" name="remember" disabled={isPending} />
        <Label
          htmlFor="remember"
          className="text-xs text-neutral-400 font-medium select-none cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Remember this device for 30 days
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-xl font-bold bg-white text-black hover:bg-neutral-200 transition-all duration-200 active:scale-[0.99]"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying Credentials...
          </>
        ) : (
          "Sign In as Administrator"
        )}
      </Button>
    </form>
  );
}
