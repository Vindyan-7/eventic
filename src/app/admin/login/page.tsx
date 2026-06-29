import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "./login-form";
import Link from "next/link";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const adminClient = await createAdminClient();
    const { data: adminUser } = await adminClient
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (adminUser) {
      redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5">
            <span className="text-black font-extrabold text-xl">E</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">Eventic</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Admin Portal
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Internal platform controls and security authorization.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-900 border border-neutral-800 py-8 px-4 shadow-xl rounded-3xl sm:px-10">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
