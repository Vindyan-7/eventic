"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Globe, Mail, Calendar, Shield, CreditCard, QrCode } from "lucide-react";
import { AdminBadge } from "./ui";

// =========================================
// USERS DETAILS DRAWER
// =========================================

export function UserDetailDrawer({
  userId,
  isOpen,
  onClose
}: {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { data: orgs } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", userId);

      const { data: regs } = await supabase
        .from("event_registrations")
        .select("*, event:event_id(*)")
        .eq("user_id", userId);

      setData({ profile, orgs: orgs || [], regs: regs || [] });
      setLoading(false);
    }

    fetchData();
  }, [isOpen, userId]);

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-neutral-950 border-neutral-900 text-white p-6">
        <SheetHeader className="p-0 border-b border-neutral-900 pb-4 mb-6">
          <SheetTitle className="text-xl font-extrabold text-white">User Console Overview</SheetTitle>
          <SheetDescription className="text-neutral-500">Comprehensive profile statistics</SheetDescription>
        </SheetHeader>

        {loading || !data ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Header info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-extrabold text-lg">
                {data.profile?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white leading-none mb-1">{data.profile?.full_name || "Eventic User"}</h3>
                <p className="text-xs text-neutral-400">{data.profile?.email}</p>
              </div>
            </div>

            {/* Grid aggregates */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-900/30 p-4 rounded-2xl border border-neutral-900">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Console Role</span>
                <div className="mt-1">
                  <AdminBadge role={data.profile?.role || "user"} className="text-[9px] px-2 py-px" />
                </div>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Account Status</span>
                <span className="inline-block mt-1 font-bold text-xs">
                  {data.profile?.is_suspended ? (
                    <span className="text-red-400 uppercase tracking-wider">Suspended</span>
                  ) : (
                    <span className="text-emerald-400 uppercase tracking-wider">Active</span>
                  )}
                </span>
              </div>
            </div>

            {/* Owned Organizations */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">Owned Organizations ({data.orgs.length})</h4>
              {data.orgs.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">Does not own any organizations.</p>
              ) : (
                <div className="space-y-2">
                  {data.orgs.map((org: any) => (
                    <div key={org.id} className="p-3 bg-neutral-900/20 border border-neutral-900 rounded-xl">
                      <p className="text-xs font-bold text-white">{org.name}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">Slug: {org.slug}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Event Registrations */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">Event Registrations ({data.regs.length})</h4>
              {data.regs.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">Has not registered for any events yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.regs.map((reg: any) => (
                    <div key={reg.id} className="p-3 bg-neutral-900/20 border border-neutral-900 rounded-xl">
                      <p className="text-xs font-bold text-white">{reg.event?.title || "Unknown Event"}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">Registered: {new Date(reg.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// =========================================
// ORGANIZATIONS DETAILS DRAWER
// =========================================

export function OrgDetailDrawer({
  orgId,
  isOpen,
  onClose
}: {
  orgId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !orgId) return;

    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      const { data: org } = await supabase
        .from("organizations")
        .select(`
          *,
          owner:owner_id (
            email,
            full_name
          )
        `)
        .eq("id", orgId)
        .single();

      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("organization_id", orgId);

      const { data: payouts } = await supabase
        .from("payout_requests")
        .select("*")
        .eq("organization_id", orgId);

      setData({ org, events: events || [], payouts: payouts || [] });
      setLoading(false);
    }

    fetchData();
  }, [isOpen, orgId]);

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-neutral-950 border-neutral-900 text-white p-6">
        <SheetHeader className="p-0 border-b border-neutral-900 pb-4 mb-6">
          <SheetTitle className="text-xl font-extrabold text-white">Organization Details</SheetTitle>
          <SheetDescription className="text-neutral-500">Corporate profile and event statistics</SheetDescription>
        </SheetHeader>

        {loading || !data ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Logo and title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-extrabold text-lg">
                {data.org?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white leading-none mb-1">{data.org?.name}</h3>
                <p className="text-xs text-neutral-400">Owner: {data.org?.owner?.full_name || "Unknown"} ({data.org?.owner?.email})</p>
              </div>
            </div>

            {/* Grid aggregates */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-900/30 p-4 rounded-2xl border border-neutral-900">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Verification State</span>
                <span className="inline-block mt-1 font-bold text-xs uppercase tracking-wider text-white">
                  {data.org?.verification_status}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Suspension</span>
                <span className="inline-block mt-1 font-bold text-xs">
                  {data.org?.is_suspended ? (
                    <span className="text-red-400 uppercase tracking-wider">Suspended</span>
                  ) : (
                    <span className="text-emerald-400 uppercase tracking-wider">Active</span>
                  )}
                </span>
              </div>
            </div>

            {/* Description & metadata */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">About</h4>
              <p className="text-xs text-neutral-450 leading-relaxed bg-neutral-900/10 p-3 border border-neutral-900 rounded-xl">
                {data.org?.description || "No description provided."}
              </p>
              <div className="flex gap-4 pt-1 text-xs text-neutral-400">
                {data.org?.website && (
                  <a href={data.org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white underline">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>
            </div>

            {/* Events Hosted */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">Events Hosted ({data.events.length})</h4>
              {data.events.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No events created by this organization.</p>
              ) : (
                <div className="space-y-2">
                  {data.events.map((event: any) => (
                    <div key={event.id} className="p-3 bg-neutral-900/20 border border-neutral-900 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-white">{event.title}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{new Date(event.starts_at).toLocaleDateString()} • {event.venue}</p>
                      </div>
                      <span className="text-[10px] font-mono bg-neutral-900 px-2 py-0.5 border border-neutral-800 rounded-md text-neutral-400 uppercase">{event.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payout Requests */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">Payout Requests ({data.payouts.length})</h4>
              {data.payouts.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No payouts requested yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.payouts.map((req: any) => (
                    <div key={req.id} className="p-3 bg-neutral-900/20 border border-neutral-900 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-white">₹{req.amount}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Requested on: {new Date(req.requested_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[10px] font-bold text-white uppercase">{req.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// =========================================
// EVENTS DETAILS DRAWER
// =========================================

export function EventDetailDrawer({
  eventId,
  isOpen,
  onClose
}: {
  eventId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !eventId) return;

    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      const { data: event } = await supabase
        .from("events")
        .select(`
          *,
          organization:organization_id (
            name,
            slug
          )
        `)
        .eq("id", eventId)
        .single();

      const { data: regs } = await supabase
        .from("event_registrations")
        .select(`
          id,
          created_at,
          ticket_number,
          profile:user_id (
            email,
            full_name
          )
        `)
        .eq("event_id", eventId);

      const { data: scanCodes } = await supabase
        .from("event_scan_codes")
        .select("*")
        .eq("event_id", eventId);

      setData({ event, regs: regs || [], scanCodes: scanCodes || [] });
      setLoading(false);
    }

    fetchData();
  }, [isOpen, eventId]);

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-neutral-950 border-neutral-900 text-white p-6">
        <SheetHeader className="p-0 border-b border-neutral-900 pb-4 mb-6">
          <SheetTitle className="text-xl font-extrabold text-white">Event Details</SheetTitle>
          <SheetDescription className="text-neutral-500">Overview of public listings and registrations</SheetDescription>
        </SheetHeader>

        {loading || !data ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Title & Banner */}
            <div>
              {data.event?.banner_url && (
                <div className="w-full h-32 rounded-xl overflow-hidden mb-4 border border-neutral-900">
                  <img src={data.event.banner_url} alt={data.event.title} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-base font-extrabold text-white">{data.event?.title}</h3>
              <p className="text-xs text-neutral-400 mt-1">Host: {data.event?.organization?.name}</p>
            </div>

            {/* Status & Pricing */}
            <div className="grid grid-cols-3 gap-3 bg-neutral-900/30 p-4 rounded-2xl border border-neutral-900 text-center">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Status</span>
                <span className="inline-block mt-1 font-bold text-xs uppercase text-white">{data.event?.status}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Type</span>
                <span className="inline-block mt-1 font-bold text-xs uppercase text-white">{data.event?.is_paid ? "Paid" : "Free"}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Featured</span>
                <span className="inline-block mt-1 font-bold text-xs text-white">
                  {data.event?.is_featured ? "YES" : "NO"}
                </span>
              </div>
            </div>

            {/* Event details */}
            <div className="space-y-2.5 bg-neutral-900/10 p-4 border border-neutral-900 rounded-xl">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Venue</span>
                <p className="text-xs font-bold text-white mt-0.5">{data.event?.venue}</p>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Timing</span>
                <p className="text-xs font-bold text-white mt-0.5">
                  {new Date(data.event?.starts_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Registrations list */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">Registrations ({data.regs.length})</h4>
              {data.regs.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No registrations yet.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {data.regs.map((reg: any) => (
                    <div key={reg.id} className="p-2.5 bg-neutral-900/20 border border-neutral-900 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white leading-none mb-1">{reg.profile?.full_name || "Eventic User"}</p>
                        <p className="text-[10px] text-neutral-500">{reg.profile?.email}</p>
                      </div>
                      <span className="font-mono text-[9px] text-neutral-400">{reg.ticket_number}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scanner sessions */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">Scanner Keys ({data.scanCodes.length})</h4>
              {data.scanCodes.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No scanner session keys generated.</p>
              ) : (
                <div className="space-y-2">
                  {data.scanCodes.map((code: any) => (
                    <div key={code.id} className="p-2.5 bg-neutral-900/20 border border-neutral-900 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <p className="font-mono font-bold text-white">{code.code}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Expires: {new Date(code.expires_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// =========================================
// TICKETS DETAILS DRAWER
// =========================================

export function TicketDetailDrawer({
  regId,
  isOpen,
  onClose
}: {
  regId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !regId) return;

    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      const { data: reg } = await supabase
        .from("event_registrations")
        .select(`
          *,
          event:event_id (
            title,
            venue,
            starts_at,
            custom_questions
          ),
          profile:user_id (
            email,
            full_name
          )
        `)
        .eq("id", regId)
        .single();

      // Query payments associated with this registration
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("registration_id", regId);

      setData({ reg, payment: payments?.[0] || null });
      setLoading(false);
    }

    fetchData();
  }, [isOpen, regId]);

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-neutral-950 border-neutral-900 text-white p-6">
        <SheetHeader className="p-0 border-b border-neutral-900 pb-4 mb-6">
          <SheetTitle className="text-xl font-extrabold text-white">Ticket Registry</SheetTitle>
          <SheetDescription className="text-neutral-500">Access credential overview</SheetDescription>
        </SheetHeader>

        {loading || !data ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Header info */}
            <div>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Ticket Number</span>
              <h3 className="text-lg font-mono font-extrabold text-white mt-0.5">{data.reg?.ticket_number}</h3>
              <p className="text-xs text-neutral-450 mt-1">Event: <span className="text-white font-bold">{data.reg?.event?.title}</span></p>
            </div>

            {/* Attendee details */}
            <div className="space-y-3 bg-neutral-900/30 p-4 border border-neutral-900 rounded-2xl">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Attendee Name</span>
                <p className="text-xs font-bold text-white mt-0.5">{data.reg?.profile?.full_name || "Eventic User"}</p>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Email</span>
                <p className="text-xs font-bold text-white mt-0.5">{data.reg?.profile?.email}</p>
              </div>
            </div>

            {/* Payment details */}
            <div className="space-y-3 bg-neutral-900/30 p-4 border border-neutral-900 rounded-2xl">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Payment State</span>
                <p className="text-xs font-bold text-white mt-0.5 uppercase">
                  {data.payment ? data.payment.status : "free registration"}
                </p>
              </div>
              {data.payment && (
                <>
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Paid Amount</span>
                    <p className="text-xs font-bold text-white mt-0.5">₹{data.payment.amount}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Razorpay Order ID</span>
                    <p className="text-xs font-mono font-bold text-neutral-400 mt-0.5">{data.payment.razorpay_order_id}</p>
                  </div>
                </>
              )}
            </div>

            {/* Custom Answers */}
            {data.reg?.custom_answers && Object.keys(data.reg.custom_answers).length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">Custom Questionnaire Responses</h4>
                <div className="space-y-3 bg-neutral-900/20 p-4 border border-neutral-900 rounded-2xl">
                  {Object.entries(data.reg.custom_answers).map(([key, val]: any) => (
                    <div key={key} className="space-y-1">
                      <span className="text-[10px] text-neutral-500 font-bold block">{key}</span>
                      <p className="text-xs text-white leading-relaxed">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// =========================================
// ADMIN DETAIL DRAWER
// =========================================

export function AdminDetailDrawer({
  adminId,
  isOpen,
  onClose
}: {
  adminId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !adminId) return;

    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      // Get admin details
      const { data: adminRecord } = await supabase
        .from("admin_users")
        .select(`
          *,
          profile:user_id (
            email,
            full_name
          )
        `)
        .eq("id", adminId)
        .single();

      // Get recent audit logs by this admin
      const { data: logs } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .eq("admin_id", adminId)
        .order("created_at", { ascending: false })
        .limit(10);

      setData({ adminRecord, logs: logs || [] });
      setLoading(false);
    }

    fetchData();
  }, [isOpen, adminId]);

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-neutral-950 border-neutral-900 text-white p-6 font-sans">
        <SheetHeader className="p-0 border-b border-neutral-900 pb-4 mb-6">
          <SheetTitle className="text-xl font-extrabold text-white">Administrator Profile</SheetTitle>
          <SheetDescription className="text-neutral-500">Security privilege audits</SheetDescription>
        </SheetHeader>

        {loading || !data ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Admin Profile Overview */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-850 flex items-center justify-center text-white font-extrabold text-lg">
                {data.adminRecord?.profile?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white leading-none mb-1">
                  {data.adminRecord?.profile?.full_name || "Console Admin"}
                </h3>
                <p className="text-xs text-neutral-400">{data.adminRecord?.profile?.email}</p>
              </div>
            </div>

            {/* Privilege and Status grid */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-900/30 p-4 rounded-2xl border border-neutral-900">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Assigned Role</span>
                <div className="mt-1">
                  <AdminBadge role={data.adminRecord?.role || "viewer"} className="text-[9px] px-1.5 py-px" />
                </div>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Access Status</span>
                <span className="inline-block mt-1 font-bold text-xs">
                  {data.adminRecord?.is_active ? (
                    <span className="text-emerald-400 uppercase tracking-wider">Active</span>
                  ) : (
                    <span className="text-red-400 uppercase tracking-wider">Inactive</span>
                  )}
                </span>
              </div>
            </div>

            {/* Time stamps */}
            <div className="space-y-3 bg-neutral-900/10 p-4 border border-neutral-900 rounded-xl">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Registered Date</span>
                <p className="text-xs font-bold text-white mt-0.5">
                  {new Date(data.adminRecord?.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Last Login Time</span>
                <p className="text-xs font-bold text-white mt-0.5">
                  {data.adminRecord?.last_login_at ? new Date(data.adminRecord.last_login_at).toLocaleString() : "Never logged in"}
                </p>
              </div>
            </div>

            {/* Recent Audit Logs activity summary */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">Recent Security Audits ({data.logs.length})</h4>
              {data.logs.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No administrative actions logged by this user.</p>
              ) : (
                <div className="space-y-2">
                  {data.logs.map((log: any) => (
                    <div key={log.id} className="p-3 bg-neutral-900/20 border border-neutral-900 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-mono font-bold text-white leading-none mb-1">{log.action}</p>
                        <p className="text-[10px] text-neutral-500">{log.entity} • id: {log.entity_id || "n/a"}</p>
                      </div>
                      <span className="text-[10px] text-neutral-500">{new Date(log.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
