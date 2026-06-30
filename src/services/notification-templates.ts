export interface NotificationRecord {
  id: string;
  recipient_id: string;
  sender_id: string | null;
  organization_id: string | null;
  event_id: string | null;
  title: string;
  message: string;
  type: string;
  category: string;
  icon: string | null;
  color: string | null;
  priority: string;
  data: any;
  action_url: string | null;
  is_read: boolean;
  is_archived: boolean;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
}

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
