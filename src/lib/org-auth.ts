import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireOrgAdmin(redirectPath?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const target = redirectPath
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : "/login";
    redirect(target);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "org_admin") {
    redirect("/dashboard");
  }

  return user;
}