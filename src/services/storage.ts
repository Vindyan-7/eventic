"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadEventBanner(
  file: File
) {
  const supabase = await createClient();

  const fileExt =
    file.name.split(".").pop();

  const fileName =
    `${Date.now()}.${fileExt}`;

  const filePath =
    `events/${fileName}`;

  const { error } =
    await supabase.storage
      .from("event-banners")
      .upload(filePath, file);

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("event-banners")
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadOrganizationLogo(file: File) {
  const supabase = await createClient();

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `logos/${fileName}`;

  const { error } = await supabase.storage
    .from("organization-logos")
    .upload(filePath, file);

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("organization-logos")
    .getPublicUrl(filePath);

  return publicUrl;
}