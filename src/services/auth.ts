"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  if (error) {
    console.error(error);
    const msg = error.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("already exists") ||
      msg.includes("email_taken") ||
      msg.includes("email already") ||
      error.status === 422
    ) {
      return {
        alreadyExists: true,
      };
    }
    return {
      error: error.message,
    };
  }

  const target = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
    ? redirectTo
    : "/dashboard";

  redirect(target);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string;

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    console.error(error);
    return {
      error: error.message,
    };
  }

  const target = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
    ? redirectTo
    : "/dashboard";

  redirect(target);
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}