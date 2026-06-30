"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Calendar, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizationCardProps {
  org: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    upcomingEvents: number;
    followers: number;
  };
}

function OrganizationCard({ org }: OrganizationCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-full rounded-3xl border border-neutral-900 bg-neutral-950 p-6 space-y-4 hover:border-neutral-800 transition-all">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 shrink-0 rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden">
          {org.logo_url ? (
            <Image
              src={org.logo_url}
              alt={org.name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-neutral-500">{getInitials(org.name)}</span>
          )}
        </div>
        <div>
          <h4 className="font-extrabold text-white text-sm line-clamp-1">{org.name}</h4>
          <span className="text-[10px] text-neutral-500 font-bold block uppercase mt-0.5 tracking-wider">Workspace Profile</span>
        </div>
      </div>

      <p className="text-neutral-400 text-xs line-clamp-2 leading-relaxed flex-1">
        {org.description || "Trusted event discovery and ticket registrations host on Eventic."}
      </p>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-900 text-neutral-500 font-bold text-[10px]">
        <div>
          <span className="block text-neutral-500">UPCOMING</span>
          <span className="text-white text-xs mt-0.5 block flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-neutral-500" /> {org.upcomingEvents} Events
          </span>
        </div>
        <div>
          <span className="block text-neutral-500">FOLLOWERS</span>
          <span className="text-white text-xs mt-0.5 block flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-neutral-500" /> {org.followers}
          </span>
        </div>
      </div>

      <Button
        asChild
        className="w-full bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 text-white rounded-xl h-10 gap-1.5 cursor-pointer font-bold mt-2"
      >
        <Link href={`/organizations/${org.slug}`}>
          View Profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

interface OrganizerSectionProps {
  featuredOrgs: any[];
  trendingOrgs: any[];
  activeOrgs: any[];
}

export function OrganizerSection({
  featuredOrgs,
  trendingOrgs,
  activeOrgs
}: OrganizerSectionProps) {
  const [activeTab, setActiveTab] = useState<"featured" | "trending" | "active">("featured");

  const getActiveList = () => {
    switch (activeTab) {
      case "featured": return featuredOrgs;
      case "trending": return trendingOrgs;
      case "active": return activeOrgs;
      default: return [];
    }
  };

  const list = getActiveList();

  return (
    <section className="py-28 bg-neutral-950 text-white border-b border-white/5 relative text-xs">
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,rgba(124,58,237,0.06),transparent_80%)] pointer-events-none z-0" />
      <div className="container mx-auto px-6 space-y-12 relative z-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-5xl mx-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-bold border border-violet-500/20 tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Workspace Hubs
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Discover verified hosts.
            </h2>
            <p className="text-neutral-400 text-xs max-w-xl leading-relaxed">
              Explore organizations, follow your favorite campus chapters, and get alerts for upcoming workshops, meetups, and hackathons.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-neutral-900 border border-neutral-850 p-1 rounded-2xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-4 py-2 font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === "featured" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`px-4 py-2 font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === "trending" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === "active" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              Active
            </button>
          </div>
        </div>

        {/* Orgs Grid */}
        <div className="max-w-5xl mx-auto">
          {list.length === 0 ? (
            <div className="border border-neutral-900 rounded-3xl p-12 text-center text-neutral-500">
              No hosts listed in this category.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.slice(0, 6).map((org) => (
                <OrganizationCard key={org.id} org={org} />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
