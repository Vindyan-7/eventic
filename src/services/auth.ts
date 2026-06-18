"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const full_name = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("SIGNUP EMAIL", email);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  console.log("SIGNUP DATA", data);
  console.log("SIGNUP ERROR", error);

  if (error) {
    return {
      error: error.message,
    };
  }

  console.log("SIGNUP SUCCESS");

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("================================");
  console.log("LOGIN ATTEMPT");
  console.log("EMAIL:", email);

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  console.log("LOGIN DATA:", data);
  console.log("LOGIN ERROR:", error);

  if (error) {
    console.log("LOGIN FAILED");

    return {
      error: error.message,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USER AFTER LOGIN:", user);

  console.log("LOGIN SUCCESS");
  console.log("REDIRECTING TO DASHBOARD");
  console.log("================================");

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();

  console.log("SIGNING OUT");

  await supabase.auth.signOut();

  redirect("/login");
}