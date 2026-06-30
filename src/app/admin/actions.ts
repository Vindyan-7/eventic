"use server";

import { requireRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/services/admin/audit";
import { revalidatePath } from "next/cache";

// =========================================
// PLATFORM OPERATIONS SERVER ACTIONS
// =========================================

// --- USER ACTIONS ---

export async function suspendUser(userId: string, reason?: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: true, suspension_reason: reason || null })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "SUSPEND_USER", "profiles", userId, { suspended: true, reason });
  revalidatePath("/admin/users");
  revalidatePath("/admin/moderation/users");
  return { success: true };
}

export async function reactivateUser(userId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: false })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "REACTIVATE_USER", "profiles", userId, { suspended: false });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function resetUserPassword(userId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "support_admin"]);
  const supabase = await createAdminClient();

  // Generate a random temporary password
  const tempPassword = `EventicPass!${Math.floor(1000 + Math.random() * 9000)}`;
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: tempPassword
  });

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "RESET_PASSWORD", "profiles", userId, { action: "password_reset_temp" });
  return { success: true, tempPassword };
}

export async function deleteUser(userId: string) {
  const admin = await requireRole(["super_admin"]);
  const supabase = await createAdminClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "DELETE_USER", "profiles", userId);
  revalidatePath("/admin/users");
  return { success: true };
}

// --- ORGANIZATION ACTIONS ---

export async function approveOrganization(orgId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({ verification_status: "approved" })
    .eq("id", orgId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "APPROVE_ORGANIZATION", "organizations", orgId, { status: "approved" });
  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function rejectOrganization(orgId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({ verification_status: "rejected" })
    .eq("id", orgId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "REJECT_ORGANIZATION", "organizations", orgId, { status: "rejected" });
  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function suspendOrganization(orgId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({ is_suspended: true })
    .eq("id", orgId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "SUSPEND_ORGANIZATION", "organizations", orgId, { suspended: true });
  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function reactivateOrganization(orgId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({ is_suspended: false })
    .eq("id", orgId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "REACTIVATE_ORGANIZATION", "organizations", orgId, { suspended: false });
  revalidatePath("/admin/organizations");
  return { success: true };
}

export async function deleteOrganization(orgId: string) {
  const admin = await requireRole(["super_admin"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", orgId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "DELETE_ORGANIZATION", "organizations", orgId);
  revalidatePath("/admin/organizations");
  return { success: true };
}

// --- EVENT ACTIONS ---

export async function featureEvent(eventId: string, featured: boolean) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("events")
    .update({ is_featured: featured })
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "FEATURE_EVENT", "events", eventId, { featured });
  revalidatePath("/admin/events");
  return { success: true };
}

export async function cancelEvent(eventId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("events")
    .update({ status: "cancelled" })
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "CANCEL_EVENT", "events", eventId);
  revalidatePath("/admin/events");
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const admin = await requireRole(["super_admin"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "DELETE_EVENT", "events", eventId);
  revalidatePath("/admin/events");
  return { success: true };
}

// --- TICKET ACTIONS ---

export async function cancelTicket(registrationId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "support_admin"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("id", registrationId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "CANCEL_TICKET", "event_registrations", registrationId);
  revalidatePath("/admin/tickets");
  return { success: true };
}

export async function transferTicket(registrationId: string, targetEmail: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "support_admin"]);
  const supabase = await createAdminClient();

  // Retrieve target user profile id by email
  const { data: targetProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", targetEmail)
    .single();

  if (profileError || !targetProfile) {
    throw new Error("No user registered with this email address.");
  }

  const { error } = await supabase
    .from("event_registrations")
    .update({ user_id: targetProfile.id })
    .eq("id", registrationId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "TRANSFER_TICKET", "event_registrations", registrationId, { targetEmail });
  revalidatePath("/admin/tickets");
  return { success: true };
}

// --- SCANNER ACTIONS ---

export async function revokeScannerSession(scanCodeId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "support_admin"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("event_scan_codes")
    .delete()
    .eq("id", scanCodeId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "REVOKE_SCANNER_SESSION", "event_scan_codes", scanCodeId);
  revalidatePath("/admin/scanner");
  return { success: true };
}

export async function extendScannerSession(scanCodeId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "support_admin"]);
  const supabase = await createAdminClient();

  // Extend scanner expiration by 24 hours
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { error } = await supabase
    .from("event_scan_codes")
    .update({ expires_at: tomorrow.toISOString() })
    .eq("id", scanCodeId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "EXTEND_SCANNER_SESSION", "event_scan_codes", scanCodeId);
  revalidatePath("/admin/scanner");
  return { success: true };
}

// --- GLOBAL CONSOLE SEARCH ---

export async function globalAdminSearch(query: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "support_admin", "moderator", "viewer"]);
  if (!query || query.trim().length < 2) {
    return { users: [], orgs: [], events: [], tickets: [] };
  }

  const supabase = await createAdminClient();
  const searchStr = `%${query}%`;

  // Query profiles
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .or(`email.ilike.${searchStr},full_name.ilike.${searchStr}`)
    .limit(5);

  // Query organizations
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .or(`name.ilike.${searchStr},slug.ilike.${searchStr}`)
    .limit(5);

  // Query events
  const { data: events } = await supabase
    .from("events")
    .select("id, title, slug")
    .or(`title.ilike.${searchStr},slug.ilike.${searchStr}`)
    .limit(5);

  // Query registrations (tickets)
  const { data: tickets } = await supabase
    .from("event_registrations")
    .select(`
      id,
      ticket_number,
      profile:user_id (
        full_name,
        email
      )
    `)
    .ilike("ticket_number", searchStr)
    .limit(5);

  // Query scanner sessions
  const { data: scanners } = await supabase
    .from("event_scan_codes")
    .select(`
      id,
      code,
      event:event_id (
        title
      )
    `)
    .ilike("code", searchStr)
    .limit(5);

  return {
    users: users || [],
    orgs: orgs || [],
    events: events || [],
    tickets: (tickets || []).map((t: any) => ({
      id: t.id,
      ticket_number: t.ticket_number,
      attendee_name: t.profile?.full_name || "Eventic User",
      attendee_email: t.profile?.email || ""
    })),
    scanners: (scanners || []).map((s: any) => ({
      id: s.id,
      code: s.code,
      event_title: s.event?.title || "Unknown Event"
    }))
  };
}

// --- PLATFORM ADMIN PRIVILEGE MANAGEMENT ---

export async function createAdminUser(email: string, role: string, isActive: boolean) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  // Find user by email in profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (profileError || !profile) {
    throw new Error("User account not found. Ask them to register first.");
  }

  // Insert admin users record
  const { data: newAdmin, error } = await supabase
    .from("admin_users")
    .insert({
      user_id: profile.id,
      role,
      is_active: isActive
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction(admin.id, "ADMIN_CREATED", "admin_users", newAdmin.id, { email, role });
  revalidatePath("/admin/admins");
  return { success: true };
}

export async function updateAdminUser(adminId: string, role: string, isActive: boolean) {
  const admin = await requireRole("super_admin");
  
  if (adminId === admin.id) {
    throw new Error("Safety Lockout: You cannot modify your own privilege role or status.");
  }

  const supabase = await createAdminClient();

  // Fetch current admin state before update
  const { data: oldAdmin } = await supabase
    .from("admin_users")
    .select("role, is_active")
    .eq("id", adminId)
    .single();

  const { error } = await supabase
    .from("admin_users")
    .update({
      role,
      is_active: isActive
    })
    .eq("id", adminId);

  if (error) {
    throw new Error(error.message);
  }

  // Determine specific audit logs
  if (oldAdmin?.role !== role) {
    await logAdminAction(admin.id, "ROLE_CHANGED", "admin_users", adminId, { from: oldAdmin?.role, to: role });
  }
  if (oldAdmin?.is_active !== isActive) {
    await logAdminAction(admin.id, isActive ? "ADMIN_ACTIVATED" : "ADMIN_DEACTIVATED", "admin_users", adminId);
  }
  await logAdminAction(admin.id, "ADMIN_UPDATED", "admin_users", adminId, { role, isActive });

  revalidatePath("/admin/admins");
  return { success: true };
}

export async function deleteAdminUser(adminId: string) {
  const admin = await requireRole("super_admin");

  if (adminId === admin.id) {
    throw new Error("Safety Lockout: You cannot delete your own administrative account.");
  }

  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("id", adminId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction(admin.id, "ADMIN_REMOVED", "admin_users", adminId);
  revalidatePath("/admin/admins");
  return { success: true };
}

export async function archiveEvent(eventId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("events")
    .update({ status: "archived" })
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "ARCHIVE_EVENT", "events", eventId);
  revalidatePath("/admin/events");
  return { success: true };
}

export async function hideEvent(eventId: string, hidden: boolean, reason?: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("events")
    .update({ is_hidden: hidden, moderation_reason: reason || null })
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, hidden ? "HIDE_EVENT" : "UNHIDE_EVENT", "events", eventId, { reason });
  revalidatePath("/admin/events");
  revalidatePath("/admin/moderation/events");
  return { success: true };
}

export async function dismissReport(reportId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("platform_reports")
    .update({ status: "dismissed" })
    .eq("id", reportId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "DISMISS_REPORT", "platform_reports", reportId);
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function resolveReport(reportId: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("platform_reports")
    .update({ status: "resolved" })
    .eq("id", reportId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "RESOLVE_REPORT", "platform_reports", reportId);
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function pinEvent(eventId: string, pinned: boolean) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("events")
    .update({ is_pinned: pinned })
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, pinned ? "PIN_EVENT" : "UNPIN_EVENT", "events", eventId);
  revalidatePath("/admin/featured-events");
  return { success: true };
}

export async function updateFeaturedOrder(eventIds: string[]) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  for (let i = 0; i < eventIds.length; i++) {
    const { error } = await supabase
      .from("events")
      .update({ featured_order: i })
      .eq("id", eventIds[i]);

    if (error) throw new Error(error.message);
  }

  await logAdminAction(admin.id, "REORDER_FEATURED_EVENTS", "events", "all", { eventIds });
  revalidatePath("/admin/featured-events");
  return { success: true };
}

export async function getCmsConfig() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_cms")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return {
      hero_heading: "Find Nearby Events",
      hero_subheading: "Discover workshops, hackathons and campus events happening around you.",
      cta_text: "Discover Events",
      stats_data: [],
      faq_data: [],
      testimonials_data: [],
      sponsors_data: [],
      footer_links: []
    };
  }
  return data;
}

export async function updateCmsConfig(config: any) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { data: existing } = await supabase.from("platform_cms").select("id").limit(1);

  let error;
  if (existing && existing.length > 0) {
    const { error: err } = await supabase
      .from("platform_cms")
      .update({
        hero_heading: config.hero_heading,
        hero_subheading: config.hero_subheading,
        cta_text: config.cta_text,
        stats_data: config.stats_data || [],
        faq_data: config.faq_data || [],
        testimonials_data: config.testimonials_data || [],
        sponsors_data: config.sponsors_data || [],
        footer_links: config.footer_links || []
      })
      .eq("id", existing[0].id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("platform_cms")
      .insert({
        hero_heading: config.hero_heading,
        hero_subheading: config.hero_subheading,
        cta_text: config.cta_text,
        stats_data: config.stats_data || [],
        faq_data: config.faq_data || [],
        testimonials_data: config.testimonials_data || [],
        sponsors_data: config.sponsors_data || [],
        footer_links: config.footer_links || []
      });
    error = err;
  }

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "UPDATE_CMS_CONFIG", "platform_cms", "global");
  revalidatePath("/");
  return { success: true };
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  type: string;
  visibility: string;
  starts_at: string;
  expires_at: string | null;
}) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("announcements")
    .insert({
      title: data.title,
      content: data.content,
      type: data.type,
      visibility: data.visibility,
      starts_at: data.starts_at,
      expires_at: data.expires_at || null
    });

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "CREATE_ANNOUNCEMENT", "announcements", "new");
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "DELETE_ANNOUNCEMENT", "announcements", id);
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function getMaintenanceSettings() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return {
      maintenance_mode: false,
      maintenance_message: "We are currently performing scheduled system updates.",
      maintenance_estimated_end: null,
      maintenance_banner_color: "amber"
    };
  }
  return data;
}

export async function updateMaintenanceSettings(config: {
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_estimated_end: string | null;
  maintenance_banner_color: string;
}) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { data: existing } = await supabase.from("platform_settings").select("id").limit(1);

  let error;
  if (existing && existing.length > 0) {
    const { error: err } = await supabase
      .from("platform_settings")
      .update({
        maintenance_mode: config.maintenance_mode,
        maintenance_message: config.maintenance_message,
        maintenance_estimated_end: config.maintenance_estimated_end ? new Date(config.maintenance_estimated_end).toISOString() : null,
        maintenance_banner_color: config.maintenance_banner_color
      })
      .eq("id", existing[0].id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("platform_settings")
      .insert({
        maintenance_mode: config.maintenance_mode,
        maintenance_message: config.maintenance_message,
        maintenance_estimated_end: config.maintenance_estimated_end ? new Date(config.maintenance_estimated_end).toISOString() : null,
        maintenance_banner_color: config.maintenance_banner_color
      });
    error = err;
  }

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "UPDATE_MAINTENANCE_SETTINGS", "platform_settings", "global");
  revalidatePath("/");
  return { success: true };
}

export async function createPlatformBanner(data: {
  title: string;
  content: string;
  type: string;
  starts_at: string;
  ends_at: string | null;
  priority: number;
  is_dismissible: boolean;
}) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("platform_banners")
    .insert({
      title: data.title,
      content: data.content,
      type: data.type,
      starts_at: data.starts_at,
      ends_at: data.ends_at || null,
      priority: data.priority,
      is_dismissible: data.is_dismissible,
      is_active: true
    });

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "CREATE_BANNER", "platform_banners", "new");
  revalidatePath("/");
  revalidatePath("/admin/platform-banners");
  return { success: true };
}

export async function deletePlatformBanner(id: string) {
  const admin = await requireRole(["super_admin", "platform_admin", "moderator"]);
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("platform_banners")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "DELETE_BANNER", "platform_banners", id);
  revalidatePath("/");
  revalidatePath("/admin/platform-banners");
  return { success: true };
}

// ==========================================
// GENERAL SETTINGS ACTIONS
// ==========================================
export async function getPlatformGeneralSettings() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_general_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return {
      platform_name: "Eventic",
      platform_description: "Trusted event ticket discovery & gate scanning infrastructure",
      support_email: "support@eventic.co",
      support_phone: "+91 99999 99999",
      timezone: "UTC",
      date_format: "YYYY-MM-DD",
      time_format: "12h",
      platform_url: "https://eventic.co"
    };
  }
  return data;
}

export async function updatePlatformGeneralSettings(config: any) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { data: existing } = await supabase.from("platform_general_settings").select("id").limit(1);

  let error;
  if (existing && existing.length > 0) {
    const { error: err } = await supabase
      .from("platform_general_settings")
      .update(config)
      .eq("id", existing[0].id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("platform_general_settings")
      .insert(config);
    error = err;
  }

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "UPDATE_GENERAL_SETTINGS", "platform_general_settings", "global");
  revalidatePath("/");
  return { success: true };
}

// ==========================================
// BRANDING SETTINGS ACTIONS
// ==========================================
export async function getPlatformBrandingSettings() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_branding_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return {
      logo_url: "",
      dark_logo_url: "",
      footer_logo_url: "",
      copyright_text: "© 2026 Eventic. All rights reserved.",
      primary_color: "#000000",
      default_banner_url: ""
    };
  }
  return data;
}

export async function updatePlatformBrandingSettings(config: any) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { data: existing } = await supabase.from("platform_branding_settings").select("id").limit(1);

  let error;
  if (existing && existing.length > 0) {
    const { error: err } = await supabase
      .from("platform_branding_settings")
      .update(config)
      .eq("id", existing[0].id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("platform_branding_settings")
      .insert(config);
    error = err;
  }

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "UPDATE_BRANDING_SETTINGS", "platform_branding_settings", "global");
  revalidatePath("/");
  return { success: true };
}

// ==========================================
// SMTP SETTINGS ACTIONS
// ==========================================
export async function getPlatformSMTPSettings() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_smtp_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return {
      smtp_host: "smtp.mailtrap.io",
      smtp_port: 2525,
      smtp_username: "",
      smtp_password: "",
      sender_name: "Eventic Platform",
      sender_email: "noreply@eventic.co"
    };
  }
  return data;
}

export async function updatePlatformSMTPSettings(config: any) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { data: existing } = await supabase.from("platform_smtp_settings").select("id").limit(1);

  let error;
  if (existing && existing.length > 0) {
    const { error: err } = await supabase
      .from("platform_smtp_settings")
      .update(config)
      .eq("id", existing[0].id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("platform_smtp_settings")
      .insert(config);
    error = err;
  }

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "UPDATE_SMTP_SETTINGS", "platform_smtp_settings", "global");
  return { success: true };
}

// ==========================================
// EMAIL TEMPLATES ACTIONS
// ==========================================
export async function getPlatformEmailTemplates() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_email_templates")
    .select("*");

  if (error) return [];
  return data;
}

export async function updatePlatformEmailTemplate(key: string, data: { subject: string; body: string }) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("platform_email_templates")
    .upsert({
      template_key: key,
      subject: data.subject,
      body: data.body
    }, { onConflict: "template_key" });

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "UPDATE_EMAIL_TEMPLATE", "platform_email_templates", key);
  return { success: true };
}

// ==========================================
// SECURITY CONFIGS ACTIONS
// ==========================================
export async function getPlatformSecuritySettings() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_security_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return {
      min_password_length: 8,
      require_uppercase: true,
      require_number: true,
      require_symbol: false,
      session_timeout: 120,
      max_login_attempts: 5,
      lockout_duration: 15
    };
  }
  return data;
}

export async function updatePlatformSecuritySettings(config: any) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { data: existing } = await supabase.from("platform_security_settings").select("id").limit(1);

  let error;
  if (existing && existing.length > 0) {
    const { error: err } = await supabase
      .from("platform_security_settings")
      .update(config)
      .eq("id", existing[0].id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("platform_security_settings")
      .insert(config);
    error = err;
  }

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "UPDATE_SECURITY_SETTINGS", "platform_security_settings", "global");
  return { success: true };
}

// ==========================================
// FEATURE FLAGS ACTIONS
// ==========================================
export async function getPlatformFeatureFlags() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_feature_flags")
    .select("*");

  if (error) {
    return [
      { flag_key: "org_registration", description: "Allow new organizations to sign up", is_enabled: true },
      { flag_key: "event_creation", description: "Allow fests and hackathons to be created by hosts", is_enabled: true },
      { flag_key: "scanner_login", description: "Allow gate checkin staff access keys verification", is_enabled: true }
    ];
  }
  return data;
}

export async function updateFeatureFlag(key: string, isEnabled: boolean) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("platform_feature_flags")
    .upsert({
      flag_key: key,
      is_enabled: isEnabled
    }, { onConflict: "flag_key" });

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "TOGGLE_FEATURE_FLAG", "platform_feature_flags", `${key}:${isEnabled}`);
  return { success: true };
}

// ==========================================
// WEBHOOKS ACTIONS
// ==========================================
export async function getPlatformWebhooks() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_webhooks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function createPlatformWebhook(webhook: { url: string; secret: string; events: string[] }) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("platform_webhooks")
    .insert({
      url: webhook.url,
      secret: webhook.secret,
      events: webhook.events,
      is_active: true
    });

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "CREATE_WEBHOOK", "platform_webhooks", webhook.url);
  revalidatePath("/admin/settings/webhooks");
  return { success: true };
}

export async function deletePlatformWebhook(id: string) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("platform_webhooks")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "DELETE_WEBHOOK", "platform_webhooks", id);
  revalidatePath("/admin/settings/webhooks");
  return { success: true };
}

// ==========================================
// API KEYS ACTIONS
// ==========================================
export async function getPlatformAPIKeys() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("platform_api_keys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function createPlatformAPIKey(data: { name: string; permissions: string[] }) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  // Generate a random mock public API key
  const randomKey = "evk_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const keyHint = randomKey.substring(0, 8) + "...";
  const keyHash = randomKey; // Simple mock representation

  const { error } = await supabase
    .from("platform_api_keys")
    .insert({
      name: data.name,
      permissions: data.permissions,
      key_hint: keyHint,
      key_hash: keyHash
    });

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "CREATE_API_KEY", "platform_api_keys", data.name);
  revalidatePath("/admin/settings/api");
  return { success: true, key: randomKey };
}

export async function revokePlatformAPIKey(id: string) {
  const admin = await requireRole("super_admin");
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("platform_api_keys")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logAdminAction(admin.id, "REVOKE_API_KEY", "platform_api_keys", id);
  revalidatePath("/admin/settings/api");
  return { success: true };
}

