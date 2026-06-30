"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Clock,
  CheckCircle,
  Building2,
  CalendarCheck,
  ArrowUpRight,
  Mail,
  Heart,
  TrendingUp,
  Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { followOrganization, unfollowOrganization } from "@/services/public-organizations";
import { getEventStatus, getEventStatusClasses } from "@/lib/event-status";

interface OrganizationHeaderProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    website: string | null;
    instagram_url: string | null;
    linkedin_url: string | null;
    email: string | null;
    location: string | null;
    created_at: string;
  };
  initialFollowers: number;
  initialIsFollowing: boolean;
  stats: {
    totalEvents: number;
    totalRegistrations: number;
    upcomingEvents: number;
    completedEvents: number;
    attendanceRate: number;
  };
  upcomingEvents: any[];
  pastEvents: any[];
}

export function OrganizationProfileHeader({
  organization,
  initialFollowers,
  initialIsFollowing,
  stats,
  upcomingEvents,
  pastEvents
}: OrganizationHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowers);
  const [pending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"overview" | "upcoming" | "past" | "about">("overview");

  const handleFollowToggle = () => {
    startTransition(async () => {
      if (isFollowing) {
        const res = await unfollowOrganization(organization.id);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success(`Unfollowed ${organization.name}`);
      } else {
        const res = await followOrganization(organization.id);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success(`Following ${organization.name}`);
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const joinedDate = new Date(organization.created_at).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="space-y-8 font-sans text-xs">
      
      {/* 1. Header Banner & Identity */}
      <div className="relative rounded-3xl border overflow-hidden bg-neutral-950 shadow-2xl">
        
        {/* Banner image or default backdrop */}
        <div className="relative h-48 md:h-64 w-full bg-neutral-900 border-b">
          {organization.banner_url ? (
            <Image
              src={organization.banner_url}
              alt={organization.name}
              fill
              className="object-cover opacity-80"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-violet-950/30 via-neutral-950 to-indigo-950/30" />
          )}

          {/* Sticky Mobile/Desktop Follow Button */}
          <div className="absolute bottom-4 right-4 z-20 md:bottom-6 md:right-6">
            <Button
              onClick={handleFollowToggle}
              disabled={pending}
              className={`rounded-full px-6 font-extrabold cursor-pointer border shadow-lg transition-all ${
                isFollowing 
                  ? "bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-850" 
                  : "bg-white border-white text-black hover:bg-neutral-200"
              }`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFollowing ? "fill-red-500 text-red-500" : ""}`} />
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="p-6 md:p-8 pt-0 relative z-10 flex flex-col md:flex-row gap-6 items-start -mt-16 md:-mt-20">
          
          {/* Logo */}
          <div className="relative w-28 h-28 md:w-36 md:h-36 shrink-0 border-4 border-neutral-950 rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center shadow-2xl">
            {organization.logo_url ? (
              <Image
                src={organization.logo_url}
                alt={organization.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-4xl font-black text-neutral-500 select-none">
                {getInitials(organization.name)}
              </span>
            )}
          </div>

          {/* Identity info */}
          <div className="flex-1 space-y-4 pt-16 md:pt-20">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center gap-2">
                {organization.name}
              </h1>
              {organization.description && (
                <p className="text-neutral-400 text-xs max-w-3xl leading-relaxed">
                  {organization.description}
                </p>
              )}
            </div>

            {/* Social details & links */}
            <div className="flex flex-wrap items-center gap-4 text-neutral-500 font-bold">
              {organization.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {organization.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Joined {joinedDate}
              </span>
              <span className="flex items-center gap-1 text-white">
                <Heart className="h-3.5 w-3.5 text-neutral-500" /> {followersCount} Followers
              </span>
            </div>

            {/* Contacts & Social Icons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {organization.website && (
                <a
                  href={organization.website.startsWith("http") ? organization.website : `https://${organization.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-neutral-900 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-neutral-450 hover:text-white transition"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {organization.instagram_url && (
                <a
                  href={organization.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-neutral-900 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-neutral-450 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {organization.linkedin_url && (
                <a
                  href={organization.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-neutral-900 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-neutral-450 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              )}
              {organization.email && (
                <a
                  href={`mailto:${organization.email}`}
                  className="p-2 border border-neutral-900 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-neutral-450 hover:text-white transition"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 2. Stats Grid Section */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        
        <div className="rounded-2xl border bg-neutral-950 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-900/40 flex items-center justify-center text-violet-400 shrink-0">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Total Hosted</p>
            <h4 className="text-lg font-extrabold text-white mt-0.5">{stats.totalEvents}</h4>
          </div>
        </div>

        <div className="rounded-2xl border bg-neutral-950 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-950/40 border border-blue-900/40 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Registrations</p>
            <h4 className="text-lg font-extrabold text-white mt-0.5">{stats.totalRegistrations}</h4>
          </div>
        </div>

        <div className="rounded-2xl border bg-neutral-950 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-900/40 flex items-center justify-center text-emerald-450 shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Attendance Rate</p>
            <h4 className="text-lg font-extrabold text-white mt-0.5">{stats.attendanceRate}%</h4>
          </div>
        </div>

        <div className="rounded-2xl border bg-neutral-950 p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border flex items-center justify-center text-neutral-400 shrink-0">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Followers</p>
            <h4 className="text-lg font-extrabold text-white mt-0.5">{followersCount}</h4>
          </div>
        </div>

      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-neutral-900">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 font-extrabold cursor-pointer border-b-2 transition-all ${
            activeTab === "overview" ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-white"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-5 py-3 font-extrabold cursor-pointer border-b-2 transition-all ${
            activeTab === "upcoming" ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-white"
          }`}
        >
          Upcoming Events ({upcomingEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-5 py-3 font-extrabold cursor-pointer border-b-2 transition-all ${
            activeTab === "past" ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-white"
          }`}
        >
          Past Events ({pastEvents.length})
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`px-5 py-3 font-extrabold cursor-pointer border-b-2 transition-all ${
            activeTab === "about" ? "border-white text-white" : "border-transparent text-neutral-500 hover:text-white"
          }`}
        >
          About
        </button>
      </div>

      {/* 4. Tab Contents rendering */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Overview shows summary + top upcoming events */}
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-white">Featured Upcoming Events</h3>
              {upcomingEvents.length === 0 ? (
                <div className="border border-neutral-900 rounded-3xl p-8 text-center text-neutral-500">
                  No upcoming events scheduled right now. Check back later!
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <EventGridCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="border border-neutral-900 rounded-3xl p-8 text-center text-neutral-500">
                No upcoming events scheduled.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventGridCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="space-y-4">
            {pastEvents.length === 0 ? (
              <div className="border border-neutral-900 rounded-3xl p-8 text-center text-neutral-500">
                No past events hosted.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-90">
                {pastEvents.map((event) => (
                  <EventGridCard key={event.id} event={event} isPast />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="border border-neutral-900 rounded-3xl p-6 bg-neutral-950/20 space-y-4 leading-relaxed text-neutral-400">
            <h3 className="text-lg font-extrabold text-white">About {organization.name}</h3>
            <p className="text-xs">{organization.description || "No description provided."}</p>
            
            <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-neutral-900 font-bold">
              <div>
                <span className="text-[10px] text-neutral-500 block">WEBSITE</span>
                {organization.website ? (
                  <a href={organization.website} className="text-white hover:underline text-xs mt-0.5 block">{organization.website}</a>
                ) : (
                  <span className="text-neutral-600 block mt-0.5">N/A</span>
                )}
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">SUPPORT EMAIL</span>
                {organization.email ? (
                  <span className="text-white text-xs mt-0.5 block">{organization.email}</span>
                ) : (
                  <span className="text-neutral-600 block mt-0.5">N/A</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function EventGridCard({ event, isPast = false }: { event: any; isPast?: boolean }) {
  const eventStatus = getEventStatus(event.starts_at, event.ends_at, event.status);
  const regCount = event.event_registrations?.length ?? 0;
  const occupancy = event.max_attendees
    ? Math.round((regCount / event.max_attendees) * 100)
    : null;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group overflow-hidden rounded-3xl border bg-background/50 hover:bg-background transition-all hover:shadow-xl hover:border-primary/20"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={event.banner_url || "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1200"}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs ${getEventStatusClasses(eventStatus)}`}>
            {eventStatus}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${event.is_paid ? "bg-blue-600 text-white" : "bg-white text-black"}`}>
            {event.is_paid ? `₹${event.ticket_price}` : "Free"}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-extrabold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-[10px] text-neutral-500 font-bold">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(event.starts_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
          </div>
          {!isPast && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>
                {regCount} / {event.max_attendees || "∞"} Registered
                {occupancy !== null && <span className="ml-1.5 text-primary">({occupancy}% Full)</span>}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
