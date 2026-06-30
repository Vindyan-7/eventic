"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import type {
  NotificationRecord,
  NotificationCategory,
  NotificationPriority,
  NotificationType,
  CreateNotificationPayload,
  BroadcastTarget
} from "./notification-templates";

// ─── Core Service Functions ───────────────────────────────────────────────────

/**
 * Creates a single notification. Always use this instead of writing to DB directly.
 */
export async function createNotification(
  payload: CreateNotificationPayload
): Promise<{ id: string } | null> {
  const adminClient = await createAdminClient();

  const { data, error } = await adminClient
    .from("notifications")
    .insert({
      recipient_id: payload.recipientId,
      sender_id: payload.senderId ?? null,
      organization_id: payload.organizationId ?? null,
      event_id: payload.eventId ?? null,
      type: payload.type,
      category: payload.category,
      title: payload.title,
      message: payload.message,
      icon: payload.icon ?? null,
      color: payload.color ?? null,
      priority: payload.priority ?? "normal",
      data: payload.data ?? {},
      action_url: payload.actionUrl ?? null,
      expires_at: payload.expiresAt ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Failed to create notification:", error);
    return null;
  }

  // Trigger optional Email channel integration
  if (payload.sendEmail) {
    await sendNotificationEmail({
      recipientId: payload.recipientId,
      subject: payload.emailSubject || payload.title,
      html: payload.emailHtml || `<p>${payload.message}</p>`,
    });
  }

  return { id: data.id };
}

/**
 * Creates multiple notifications in a single DB round-trip.
 */
export async function createBulkNotifications(
  payloads: CreateNotificationPayload[]
): Promise<number> {
  if (!payloads.length) return 0;
  const adminClient = await createAdminClient();

  const rows = payloads.map((p) => ({
    recipient_id: p.recipientId,
    sender_id: p.senderId ?? null,
    organization_id: p.organizationId ?? null,
    event_id: p.eventId ?? null,
    type: p.type,
    category: p.category,
    title: p.title,
    message: p.message,
    icon: p.icon ?? null,
    color: p.color ?? null,
    priority: p.priority ?? "normal",
    data: p.data ?? {},
    action_url: p.actionUrl ?? null,
    expires_at: p.expiresAt ?? null,
  }));

  const { error, count } = await adminClient
    .from("notifications")
    .insert(rows)
    .select("id");

  if (error) {
    console.error("[NotificationService] Bulk create failed:", error.message);
    return 0;
  }

  return count ?? payloads.length;
}

/**
 * Broadcasts a notification to a target audience.
 * Returns the number of notifications created.
 */
export async function broadcastNotification(
  senderId: string,
  payload: Omit<CreateNotificationPayload, "recipientId">,
  target: BroadcastTarget
): Promise<{ count: number }> {
  const adminClient = await createAdminClient();

  // Resolve recipients
  let recipientIds: string[] = [];

  if (target.type === "everyone" || target.type === "users") {
    const { data } = await adminClient
      .from("profiles")
      .select("id")
      .not("role", "in", '("super_admin","platform_admin","moderator","support_admin","viewer")');
    recipientIds = (data ?? []).map((p) => p.id);
  } else if (target.type === "organizers") {
    const { data } = await adminClient
      .from("profiles")
      .select("id")
      .eq("role", "org_admin");
    recipientIds = (data ?? []).map((p) => p.id);
  } else if (target.type === "volunteers") {
    const { data } = await adminClient
      .from("profiles")
      .select("id")
      .eq("role", "volunteer");
    recipientIds = (data ?? []).map((p) => p.id);
  } else if (target.type === "organization") {
    const { data: members } = await adminClient
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", target.organizationId)
      .eq("status", "active");
    const { data: owner } = await adminClient
      .from("organizations")
      .select("owner_id")
      .eq("id", target.organizationId)
      .single();
    const memberIds = (members ?? []).map((m) => m.user_id);
    if (owner?.owner_id) memberIds.push(owner.owner_id);
    recipientIds = [...new Set(memberIds)];
  } else if (target.type === "event") {
    const { data } = await adminClient
      .from("event_registrations")
      .select("user_id")
      .eq("event_id", target.eventId);
    recipientIds = (data ?? []).map((r) => r.user_id);
  }

  if (!recipientIds.length) return { count: 0 };

  // Create payloads
  const notifications = recipientIds.map((recipientId) => ({
    ...payload,
    recipientId,
    senderId,
  }));

  // Chunk inserts to prevent payload limits
  const chunkSize = 500;
  let count = 0;
  for (let i = 0; i < notifications.length; i += chunkSize) {
    const chunk = notifications.slice(i, i + chunkSize);
    count += await createBulkNotifications(chunk);
  }

  // Log broadcast
  await logBroadcast({
    senderId,
    title: payload.title,
    message: payload.message,
    targetType: target.type,
    targetId: target.type === "organization" ? target.organizationId : target.type === "event" ? target.eventId : undefined,
    recipientCount: count,
    actionUrl: payload.actionUrl,
  });

  return { count };
}

/**
 * Email Channel stub - Logs mock email delivery output to Console.
 */
export async function sendNotificationEmail({
  recipientId,
  subject,
  html,
}: {
  recipientId: string;
  subject: string;
  html: string;
}) {
  const adminClient = await createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("email, full_name")
    .eq("id", recipientId)
    .single();

  const email = profile?.email || "unknown@student.edu";
  const name = profile?.full_name || "Student";

  console.log("=========================================");
  console.log(`[EMAIL DISPATCH] To: ${name} <${email}>`);
  console.log(`[EMAIL DISPATCH] Subject: ${subject}`);
  console.log("-----------------------------------------");
  console.log(html.replace(/<[^>]*>/g, " ")); // Plaintext strip for clean console display
  console.log("=========================================");
}

/**
 * Fetch unread notification count.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false)
    .eq("is_archived", false);

  if (error) {
    console.error("Error fetching unread notification count:", error);
    return 0;
  }
  return count ?? 0;
}

/**
 * Fetch paginated list of notifications for user.
 */
export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  filter?: "all" | "unread" | "archived";
  category?: string;
  priority?: NotificationPriority;
  search?: string;
  isRead?: boolean;
  isArchived?: boolean;
}

export async function getNotifications(options: GetNotificationsOptions = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { notifications: [], total: 0 };

  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("recipient_id", user.id);

  // Apply filters
  if (options.filter === "unread") {
    query = query.eq("is_read", false).eq("is_archived", false);
  } else if (options.filter === "archived") {
    query = query.eq("is_archived", true);
  } else {
    if (options.isArchived !== undefined) {
      query = query.eq("is_archived", options.isArchived);
    } else {
      query = query.eq("is_archived", false);
    }
  }

  if (options.isRead !== undefined) {
    query = query.eq("is_read", options.isRead);
  }

  if (options.category && options.category !== "all") {
    query = query.eq("category", options.category);
  }

  if (options.priority) {
    query = query.eq("priority", options.priority);
  }

  if (options.search) {
    query = query.or(`title.ilike.%${options.search}%,message.ilike.%${options.search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], total: 0 };
  }

  return {
    notifications: data || [],
    total: count ?? 0,
  };
}

/**
 * Mark notification as read.
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_id", user.id);

  return !error;
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  return !error;
}

/**
 * Archive a notification.
 */
export async function archiveNotification(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("notifications")
    .update({ is_archived: true })
    .eq("id", id)
    .eq("recipient_id", user.id);

  return !error;
}

/**
 * Fetch user's notification preferences.
 */
export async function getNotificationPreferences() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Attempt to select
  let { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Auto-provision if missing
  if (!data && !error) {
    const adminClient = await createAdminClient();
    const { data: newPrefs, error: insertError } = await adminClient
      .from("notification_preferences")
      .insert({ user_id: user.id })
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to auto-provision notification preferences:", insertError);
      return null;
    }
    data = newPrefs;
  }

  return data;
}

/**
 * Update user's notification preferences.
 */
export async function updateNotificationPreferences(prefs: {
  website_enabled: boolean;
  email_enabled: boolean;
  pref_events: boolean;
  pref_registrations: boolean;
  pref_workspace_invites: boolean;
  pref_volunteer_invites: boolean;
  pref_certificates: boolean;
  pref_waitlist: boolean;
  pref_platform: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: user.id,
      ...prefs,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Failed to update notification preferences:", error);
    return { error: error.message };
  }
  return { success: true };
}

/**
 * Log broadcast dispatch.
 */
export async function logBroadcast(payload: {
  senderId: string;
  title: string;
  message: string;
  targetType: string;
  targetId?: string;
  recipientCount: number;
  actionUrl?: string;
}) {
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from("notification_broadcasts")
    .insert({
      sender_id: payload.senderId,
      title: payload.title,
      message: payload.message,
      target_type: payload.targetType,
      target_id: payload.targetId ?? null,
      recipient_count: payload.recipientCount,
      action_url: payload.actionUrl ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to log broadcast:", error);
  }
  return data?.id || null;
}

/**
 * Retrieve broadcast logs for admins.
 */
export async function getBroadcastLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_broadcasts")
    .select(`
      *,
      sender:sender_id (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching broadcast logs:", error);
    return [];
  }
  return data || [];
}

/**
 * Compatibility wrapper functions.
 */
export async function getUserNotifications() {
  const res = await getNotifications({ page: 1, limit: 100 });
  return res.notifications;
}

export async function markNotificationRead(id: string) {
  return markNotificationAsRead(id);
}

export async function markAllNotificationsRead() {
  return markAllNotificationsAsRead();
}

export async function markRead(id: string) {
  return markNotificationAsRead(id);
}

export async function markAllRead() {
  return markAllNotificationsAsRead();
}

export async function clearAllRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("recipient_id", user.id)
    .eq("is_read", true);
  return !error;
}

export async function deleteNotification(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("recipient_id", user.id);
  return !error;
}

export async function saveNotificationPreferences(prefs: any) {
  return updateNotificationPreferences(prefs);
}
