"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadOrganizationLogo } from "./storage";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const website = formData.get("website") as string;

  const slug = generateSlug(name);

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      owner_id: user.id,
      name,
      slug,
      description,
      website,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("profiles")
    .update({
      role: "org_admin",
    })
    .eq("id", user.id);

  redirect("/org");
}


export async function getCurrentOrganization() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: "Unauthorized",
    };
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data,
    error: null,
  };
}

export async function updateOrganization(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!organization) {
    throw new Error("Organization not found");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const website = formData.get("website") as string;
  const logoFile = formData.get("logo") as File;

  let logoUrl = organization.logo_url;

  if (logoFile && logoFile.size > 0) {
    logoUrl = await uploadOrganizationLogo(logoFile);
  }

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      slug,
      description,
      website,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", organization.id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/org/settings");
}