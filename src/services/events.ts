"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadEventBanner } from "./storage";

function generateSlug(title: string) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

export async function createEvent(formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
        };
    }

    const { data: organization } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id)
        .single();

    if (!organization) {
        return {
            error: "Organization not found",
        };
    }

    const bannerFile = formData.get("banner") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const venue = formData.get("venue") as string;
    const starts_at = formData.get("starts_at") as string;
    const ends_at = formData.get("ends_at") as string;
    const max_attendees =
        formData.get("max_attendees")
            ? Number(
                formData.get(
                    "max_attendees"
                )
            )
            : null;

    const is_paid = formData.get("is_paid") === "on";

    const ticket_price = Number(
        formData.get("ticket_price") || 0
    );

    const category = formData.get("category") as string;
    const status = (formData.get("status") as string) || "draft";

    const custom_questions_raw = formData.get("custom_questions") as string;
    let custom_questions = [];
    if (custom_questions_raw) {
        try {
            custom_questions = JSON.parse(custom_questions_raw);
        } catch (e) {
            console.error("Failed to parse custom questions", e);
        }
    }

    const slug = generateSlug(title);

    let bannerUrl: string | null = null;

    if (bannerFile && bannerFile.size > 0) {
        bannerUrl = await uploadEventBanner(bannerFile);
    }

    const { error } = await supabase
        .from("events")
        .insert({
            organization_id: organization.id,
            title,
            slug,
            description,
            venue,
            starts_at,
            ends_at,
            max_attendees,
            is_paid,
            ticket_price,
            banner_url: bannerUrl,
            category,
            status,
            custom_questions,
        });

    if (error) {
        return {
            error: error.message,
        };
    }

    redirect("/org/events");
}

export async function updateEvent(eventId: string, formData: FormData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const { data: organization } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!organization) {
        return { error: "Organization not found" };
    }

    const { data: existingEvent } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .eq("organization_id", organization.id)
        .single();

    if (!existingEvent) {
        return { error: "Event not found" };
    }

    const bannerFile = formData.get("banner") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const venue = formData.get("venue") as string;
    const starts_at = formData.get("starts_at") as string;
    const ends_at = formData.get("ends_at") as string;
    const max_attendees =
        formData.get("max_attendees")
            ? Number(
                formData.get(
                    "max_attendees"
                )
            )
            : null;

    const is_paid = formData.get("is_paid") === "on";
    const ticket_price = Number(formData.get("ticket_price") || 0);
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const custom_questions_raw = formData.get("custom_questions") as string;
    
    let custom_questions = [];
    if (custom_questions_raw) {
        try {
            custom_questions = JSON.parse(custom_questions_raw);
        } catch (e) {
            console.error("Failed to parse custom questions", e);
        }
    }

    let bannerUrl = existingEvent.banner_url;
    if (bannerFile && bannerFile.size > 0) {
        bannerUrl = await uploadEventBanner(bannerFile);
    }

    let slug = existingEvent.slug;
    if (title && title !== existingEvent.title) {
        slug = generateSlug(title);
    }

    const { error } = await supabase
        .from("events")
        .update({
            title,
            slug,
            description,
            venue,
            starts_at,
            ends_at,
            max_attendees,
            is_paid,
            ticket_price,
            banner_url: bannerUrl,
            category,
            status,
            custom_questions,
            updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);

    if (error) {
        return { error: error.message };
    }

    redirect(`/org/events/${eventId}`);
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            error: "Unauthorized",
        };
    }

    const { data: organization } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!organization) {
        return {
            error: "Organization not found",
        };
    }

    const { data: event } = await supabase
        .from("events")
        .select("id")
        .eq("id", eventId)
        .eq("organization_id", organization.id)
        .single();

    if (!event) {
        return {
            error: "Event not found",
        };
    }

    const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

    if (error) {
        return {
            error: error.message,
        };
    }

    redirect("/org/events");
}