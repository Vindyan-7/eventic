"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationCategory =
  | "Events"
  | "Tickets"
  | "Workspace"
  | "Volunteer"
  | "Certificates"
  | "Waitlist"
  | "Platform"
  | "Admin";

export type NotificationPriority = "low" | "normal" | "high" | "critical";

export type NotificationType =
  // User notifications
  | "REGISTRATION_CONFIRMED"
  | "TICKET_GENERATED"
  | "TICKET_CLAIMED"
  | "REGISTRATION_CANCELLED"
  | "EVENT_UPDATED"
  | "EVENT_CANCELLED"
  | "EVENT_REMINDER"
  | "WAITLIST_JOINED"
  | "SEAT_AVAILABLE"
  | "SEAT_EXPIRING"
  | "SEAT_EXPIRED"
  | "CERTIFICATE_READY"
  | "WORKSPACE_INVITATION"
  | "VOLUNTEER_INVITATION"
  // Organizer notifications
  | "NEW_REGISTRATION"
  | "REGISTRATION_CANCELLED_ORG"
  | "VOLUNTEER_JOINED"
  | "INVITATION_ACCEPTED"
  | "CAPACITY_REACHED"
  | "WAITLIST_STARTED"
  | "WAITLIST_CLAIMED"
  | "EVENT_PUBLISHED"
  | "EVENT_COMPLETED"
  // Admin notifications
  | "ORGANIZATION_PENDING"
  | "ORGANIZATION_APPROVED"
  | "ORGANIZATION_REJECTED"
  | "SYSTEM_ALERT"
  | "MAINTENANCE"
  | "BROADCAST"
  // Organizer announcements
  | "ANNOUNCEMENT";

export interface CreateNotificationPayload {
  recipientId: string;
  senderId?: string;
  organizationId?: string;
  eventId?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  icon?: string;
  color?: string;
  priority?: NotificationPriority;
  data?: Record<string, unknown>;
  actionUrl?: string;
  expiresAt?: string;
  sendEmail?: boolean;
  emailSubject?: string;
  emailHtml?: string;
}

export type BroadcastTarget =
  | { type: "everyone" }
  | { type: "users" }
  | { type: "organizers" }
  | { type: "volunteers" }
  | { type: "organization"; organizationId: string }
  | { type: "event"; eventId: string };

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  isRead?: boolean;
  isArchived?: boolean;
  priority?: NotificationPriority;
  search?: string;
}

export interface NotificationRecord {
  id: string;
  recipient_id: string;
  sender_id: string | null;
  organization_id: string | null;
  event_id: string | null;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  icon: string | null;
  color: string | null;
  priority: NotificationPriority;
  data: Record<string, unknown> | null;
  action_url: string | null;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  read_at: string | null;
  expires_at: string | null;
}

// ─── Typed Notification Factory ───────────────────────────────────────────────

export const NOTIFICATION_TEMPLATES = {
  // ── USER ──
  REGISTRATION_CONFIRMED: (
    eventTitle: string,
    eventId: string,
    ticketId?: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "REGISTRATION_CONFIRMED",
    category: "Tickets",
    title: "Registration Confirmed! 🎉",
    message: `You're registered for ${eventTitle}. Your ticket is ready.`,
    icon: "Ticket",
    color: "text-green-500",
    priority: "normal",
    actionUrl: ticketId ? `/dashboard/tickets/${ticketId}` : "/dashboard/tickets",
    eventId,
    sendEmail: true,
    emailSubject: `Your ticket for ${eventTitle}`,
    emailHtml: `<p>You're registered for <strong>${eventTitle}</strong>. View your ticket in your dashboard.</p>`,
    data: { eventId, ticketId },
  }),

  REGISTRATION_CANCELLED: (
    eventTitle: string,
    eventId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "REGISTRATION_CANCELLED",
    category: "Tickets",
    title: "Registration Cancelled",
    message: `Your registration for ${eventTitle} has been cancelled.`,
    icon: "XCircle",
    color: "text-red-500",
    priority: "normal",
    actionUrl: `/events/${eventId}`,
    eventId,
    data: { eventId },
  }),

  EVENT_UPDATED: (
    eventTitle: string,
    eventId: string,
    change: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "EVENT_UPDATED",
    category: "Events",
    title: "Event Updated",
    message: `${eventTitle} has been updated: ${change}`,
    icon: "RefreshCw",
    color: "text-blue-500",
    priority: "normal",
    actionUrl: `/events/${eventId}`,
    eventId,
    data: { eventId, change },
  }),

  EVENT_CANCELLED: (
    eventTitle: string,
    eventId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "EVENT_CANCELLED",
    category: "Events",
    title: "Event Cancelled",
    message: `${eventTitle} has been cancelled by the organizer.`,
    icon: "Ban",
    color: "text-red-500",
    priority: "high",
    actionUrl: "/dashboard/events",
    eventId,
    data: { eventId },
  }),

  WAITLIST_JOINED: (
    eventTitle: string,
    eventId: string,
    position: number
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "WAITLIST_JOINED",
    category: "Waitlist",
    title: "Joined Waitlist",
    message: `You're #${position} on the waitlist for ${eventTitle}. We'll notify you when a seat opens.`,
    icon: "Clock",
    color: "text-yellow-500",
    priority: "normal",
    actionUrl: "/dashboard/waitlist",
    eventId,
    data: { eventId, position },
  }),

  SEAT_AVAILABLE: (
    eventTitle: string,
    eventId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "SEAT_AVAILABLE",
    category: "Waitlist",
    title: "Seat Available! ⚡",
    message: `A seat opened up for ${eventTitle}! Claim your ticket within 60 minutes.`,
    icon: "Ticket",
    color: "text-green-500",
    priority: "high",
    actionUrl: "/dashboard/waitlist",
    eventId,
    sendEmail: true,
    emailSubject: `🎟 A seat is available for ${eventTitle}!`,
    emailHtml: `<p>A seat opened up for <strong>${eventTitle}</strong>! You have 60 minutes to claim your ticket.</p>`,
    data: { eventId },
  }),

  SEAT_EXPIRED: (
    eventTitle: string,
    eventId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "SEAT_EXPIRED",
    category: "Waitlist",
    title: "Seat Offer Expired",
    message: `Your seat offer for ${eventTitle} has expired. You've been moved back to the waitlist.`,
    icon: "AlertCircle",
    color: "text-orange-500",
    priority: "normal",
    actionUrl: "/dashboard/waitlist",
    eventId,
    data: { eventId },
  }),

  CERTIFICATE_READY: (
    eventTitle: string,
    eventId: string,
    certificateId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "CERTIFICATE_READY",
    category: "Certificates",
    title: "Certificate Ready 🎓",
    message: `Your certificate for ${eventTitle} is ready to download!`,
    icon: "Award",
    color: "text-purple-500",
    priority: "normal",
    actionUrl: `/dashboard/tickets`,
    eventId,
    data: { eventId, certificateId },
  }),

  WORKSPACE_INVITATION: (
    orgName: string,
    organizationId: string,
    inviteId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "WORKSPACE_INVITATION",
    category: "Workspace",
    title: "Workspace Invitation",
    message: `You've been invited to join ${orgName} as a team member.`,
    icon: "UserPlus",
    color: "text-blue-500",
    priority: "high",
    actionUrl: `/org/settings/members`,
    organizationId,
    data: { organizationId, inviteId },
  }),

  VOLUNTEER_INVITATION: (
    orgName: string,
    eventTitle: string,
    organizationId: string,
    eventId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "VOLUNTEER_INVITATION",
    category: "Volunteer",
    title: "Volunteer Invitation",
    message: `${orgName} has invited you to volunteer at ${eventTitle}.`,
    icon: "HandHeart",
    color: "text-pink-500",
    priority: "high",
    actionUrl: `/org`,
    organizationId,
    eventId,
    data: { organizationId, eventId },
  }),

  // ── ORGANIZER ──
  NEW_REGISTRATION: (
    attendeeName: string,
    eventTitle: string,
    eventId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "NEW_REGISTRATION",
    category: "Events",
    title: "New Registration",
    message: `${attendeeName} just registered for ${eventTitle}.`,
    icon: "UserCheck",
    color: "text-green-500",
    priority: "low",
    actionUrl: `/org/events/${eventId}/attendees`,
    eventId,
    data: { eventId, attendeeName },
  }),

  CAPACITY_REACHED: (
    eventTitle: string,
    eventId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "CAPACITY_REACHED",
    category: "Events",
    title: "Event at Full Capacity",
    message: `${eventTitle} has reached its maximum capacity. Waitlist is now active.`,
    icon: "Users",
    color: "text-orange-500",
    priority: "high",
    actionUrl: `/org/events/${eventId}`,
    eventId,
    data: { eventId },
  }),

  EVENT_ANNOUNCEMENT: (
    orgName: string,
    eventTitle: string,
    announcementTitle: string,
    message: string,
    eventId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "ANNOUNCEMENT",
    category: "Events",
    title: announcementTitle,
    message,
    icon: "Megaphone",
    color: "text-blue-500",
    priority: "normal",
    actionUrl: `/events/${eventId}`,
    eventId,
    data: { eventId, orgName, eventTitle },
  }),

  // ── ADMIN ──
  ORGANIZATION_PENDING: (
    orgName: string,
    orgId: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "ORGANIZATION_PENDING",
    category: "Admin",
    title: "New Organization Pending Approval",
    message: `${orgName} is pending verification review.`,
    icon: "Building2",
    color: "text-yellow-500",
    priority: "normal",
    actionUrl: `/admin/organizations/verification`,
    data: { orgId, orgName },
  }),

  BROADCAST: (
    title: string,
    message: string,
    actionUrl?: string
  ): Omit<CreateNotificationPayload, "recipientId"> => ({
    type: "BROADCAST",
    category: "Platform",
    title,
    message,
    icon: "Megaphone",
    color: "text-primary",
    priority: "normal",
    actionUrl: actionUrl || "/dashboard",
    data: {},
  }),
};

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
      data: payload.data ?? null,
      action_url: payload.actionUrl ?? null,
      is_read: false,
      is_archived: false,
      expires_at: payload.expiresAt ?? null,
      // Keep legacy columns populated for backward compat
      user_id: payload.recipientId,
      read: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[NotificationService] Failed to create notification:", error.message);
    return null;
  }

  // Fire email hook if requested
  if (payload.sendEmail && payload.emailSubject && payload.emailHtml) {
    // Get recipient email
    const { data: profile } = await adminClient
      .from("profiles")
      .select("email")
      .eq("id", payload.recipientId)
      .single();

    if (profile?.email) {
      await sendEmail(profile.email, payload.emailSubject, payload.emailHtml).catch((err) =>
        console.warn("[NotificationService] Email send failed (non-fatal):", err.message)
      );
    }
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
    data: p.data ?? null,
    action_url: p.actionUrl ?? null,
    is_read: false,
    is_archived: false,
    expires_at: p.expiresAt ?? null,
    user_id: p.recipientId,
    read: false,
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
      .eq("event_id", target.eventId)
      .eq("status", "confirmed");
    recipientIds = (data ?? []).map((r) => r.user_id);
  }

  if (!recipientIds.length) return { count: 0 };

  const payloads: CreateNotificationPayload[] = recipientIds.map((id) => ({
    ...payload,
    recipientId: id,
    senderId,
  }));

  const count = await createBulkNotifications(payloads);

  // Log broadcast
  await adminClient.from("notification_broadcasts").insert({
    sender_id: senderId,
    title: payload.title,
    message: payload.message,
    category: payload.category,
    priority: payload.priority ?? "normal",
    target_type: target.type,
    target_id:
      target.type === "organization"
        ? target.organizationId
        : target.type === "event"
        ? target.eventId
        : null,
    recipient_count: count,
    action_url: payload.actionUrl ?? null,
  });

  return { count };
}

/**
 * Get notifications for the current authenticated user.
 */
export async function getNotifications(
  options: GetNotificationsOptions = {}
): Promise<{ notifications: NotificationRecord[]; total: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { notifications: [], total: 0 };

  const {
    page = 1,
    limit = 20,
    category,
    isRead,
    isArchived = false,
    priority,
    search,
  } = options;

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("recipient_id", user.id)
    .eq("is_archived", isArchived)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (category) query = query.eq("category", category);
  if (isRead !== undefined) query = query.eq("is_read", isRead);
  if (priority) query = query.eq("priority", priority);
  if (search) {
    query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error || !data) return { notifications: [], total: 0 };
  return { notifications: data as NotificationRecord[], total: count ?? 0 };
}

/**
 * Get unread notification count for the current user.
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false)
    .eq("is_archived", false);

  if (error) return 0;
  return count ?? 0;
}

/**
 * Mark a single notification as read.
 */
export async function markRead(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true, read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_id", user.id);
}

/**
 * Mark all notifications as read for current user.
 */
export async function markAllRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_read: true, read: true, read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("is_read", false);
}

/**
 * Archive a notification (moves it out of main feed).
 */
export async function archiveNotification(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_archived: true, is_read: true })
    .eq("id", notificationId)
    .eq("recipient_id", user.id);
}

/**
 * Delete a notification permanently.
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("recipient_id", user.id);
}

/**
 * Clear all read notifications (bulk archive).
 */
export async function clearAllRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("notifications")
    .update({ is_archived: true })
    .eq("recipient_id", user.id)
    .eq("is_read", true)
    .eq("is_archived", false);
}

/**
 * Get notification preferences for the current user.
 * Returns defaults if no preferences exist.
 */
export async function getNotificationPreferences() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    data ?? {
      user_id: user.id,
      website_enabled: true,
      email_enabled: true,
      pref_events: true,
      pref_registrations: true,
      pref_workspace_invites: true,
      pref_volunteer_invites: true,
      pref_certificates: true,
      pref_waitlist: true,
      pref_platform: true,
    }
  );
}

/**
 * Save notification preferences for the current user.
 */
export async function saveNotificationPreferences(prefs: {
  website_enabled: boolean;
  email_enabled: boolean;
  pref_events: boolean;
  pref_registrations: boolean;
  pref_workspace_invites: boolean;
  pref_volunteer_invites: boolean;
  pref_certificates: boolean;
  pref_waitlist: boolean;
  pref_platform: boolean;
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("notification_preferences").upsert({
    user_id: user.id,
    ...prefs,
    updated_at: new Date().toISOString(),
  });
}

// ─── Email Hook (stub) ────────────────────────────────────────────────────────
// When RESEND_API_KEY is present in environment, this sends real emails.
// Otherwise it logs to console (safe in development, non-breaking in production).

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[NotificationService] Email stub — would send to: ${to}`);
    console.log(`[NotificationService] Subject: ${subject}`);
    return;
  }

  // Dynamically import resend only when API key is present
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const from = process.env.EMAIL_FROM ?? "Eventic <noreply@eventic.app>";

    await resend.emails.send({ from, to, subject, html });
  } catch (err: any) {
    console.error("[NotificationService] Resend error:", err.message);
  }
}

// ─── Backward-compatible exports (used by existing bell component) ─────────────

/** @deprecated Use getNotifications() instead */
export async function getUserNotifications() {
  const { notifications } = await getNotifications({ limit: 20 });
  return notifications;
}

/** @deprecated Use markRead() instead */
export async function markNotificationRead(notificationId: string) {
  return markRead(notificationId);
}

/** @deprecated Use markAllRead() instead */
export async function markAllNotificationsRead() {
  return markAllRead();
}
