import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/forms/login-form";

interface Props {
    searchParams: Promise<{
        redirect?: string;
    }>;
}

export default async function LoginPage({ searchParams }: Props) {
    const { redirect: redirectPath } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect(redirectPath || "/dashboard");
    }

    return (
        <div className="max-w-md mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">
                Login
            </h1>

            <LoginForm />
        </div>
    );
}