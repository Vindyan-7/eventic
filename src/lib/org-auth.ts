import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireOrgAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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