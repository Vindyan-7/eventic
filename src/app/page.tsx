"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { motion, useInView } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle,
  Building2,
  TrendingUp,
  History,
  Ticket,
  QrCode,
  CreditCard,
  BarChart3
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPublishedEvents } from "@/services/public-events";
import { getEventStatus, getEventStatusClasses } from "@/lib/event-status";

// Deterministic date formatter to avoid SSR / Hydration mismatch
function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

function formatEventLongDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// Lightweight CountUp component using requestAnimationFrame
function CountUp({ to, duration = 1.5, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    const node = ref.current;
    if (!node) return;

    let startTime: number;
    let frameId: number;

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentVal = Math.round(progress * to);
      node.textContent = currentVal.toLocaleString("en-IN") + suffix;

      if (progress < 1) {
        frameId = requestAnimationFrame(animateCount);
      }
    };

    frameId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(frameId);
  }, [to, duration, inView, suffix]);

  return <span ref={ref} className="font-extrabold text-foreground">0{suffix}</span>;
}

// Spotlight Hero Section utilizing native CSS custom properties for hover tracking
function SpotlightHero({ handleCtaClick, user, loading }: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative py-24 lg:py-36 overflow-hidden bg-neutral-950 text-white group/hero border-b border-white/5"
      style={{
        "--mouse-x": "50%",
        "--mouse-y": "50%",
      } as React.CSSProperties}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,rgba(124,58,237,0.12),transparent_80%)] pointer-events-none z-0" />
      
      {/* Spotlight radial gradient (Desktop hover) */}
      <div 
        className="absolute inset-0 opacity-0 group-hover/hero:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(124, 58, 237, 0.15), transparent 80%)`
        }}
      />
      
      {/* Grid overlay pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/20 mb-6 tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Where communities gather
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
              Discover & Host <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Events Seamlessly</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Join thousands of makers, builders, and creators. Discover hackathons, workshops, fests, and local meetups near you.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button 
              size="lg" 
              onClick={handleCtaClick}
              className="h-14 px-10 rounded-full text-base font-bold gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/45 transition-all duration-300 w-full sm:w-auto text-white cursor-pointer"
            >
              Explore Events <ArrowRight className="h-5 w-5" />
            </Button>
            
            {!loading && user ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 rounded-full text-base font-bold border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto transition-all cursor-pointer"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 rounded-full text-base font-bold border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto transition-all cursor-pointer"
              >
                <Link href={ROUTES.AUTH.REGISTER}>Host an Event</Link>
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    getPublishedEvents().then((data) => {
      setEvents(data || []);
    }).catch((err) => {
      console.error("Failed to load events", err);
    });
  }, []);

  const handleCtaClick = () => {
    if (user) {
      router.push("/events");
    } else {
      router.push("/register");
    }
  };

  // 1. Upcoming Events (limit 3)
  const upcomingEvents = events
    .filter((event: any) => {
      const status = getEventStatus(event.starts_at, event.ends_at, event.status);
      return status === "Upcoming" || status === "Live";
    })
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 3);

  // 2. Trending Events (Highest registrations, limit 3)
  const trendingEvents = [...events]
    .sort((a, b) => {
      const regA = a.event_registrations?.length ?? 0;
      const regB = b.event_registrations?.length ?? 0;
      return regB - regA;
    })
    .slice(0, 3);

  // 3. Past Highlights (Completed, limit 3)
  const pastHighlights = events
    .filter((event: any) => {
      const status = getEventStatus(event.starts_at, event.ends_at, event.status);
      return status === "Completed";
    })
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Glassmorphic Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Eventic</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <Button asChild className="rounded-full px-6 cursor-pointer">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="cursor-pointer">
                  <Link href={ROUTES.AUTH.LOGIN}>Login</Link>
                </Button>
                <Button asChild className="rounded-full px-6 cursor-pointer">
                  <Link href={ROUTES.AUTH.REGISTER}>Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16 space-y-20 pb-20">
        {/* Spotlight Hero Section */}
        <SpotlightHero handleCtaClick={handleCtaClick} user={user} loading={loading} />

        {/* Statistics Section (CountUp triggers when scrolled into view) */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto border border-border/60 rounded-3xl p-8 bg-card/30 backdrop-blur-xs">
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                <CountUp to={25000} suffix="+" />
              </p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tickets Claimed</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                <CountUp to={540} suffix="+" />
              </p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Events Hosted</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                <CountUp to={98} suffix="%" />
              </p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Check-in Rate</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                <CountUp to={180} suffix="+" />
              </p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Organizers</p>
            </div>
          </div>
        </section>

        {/* Bento Grid Features Layout */}
        <section className="py-24 bg-neutral-950 text-white border-y border-white/5">
          <div className="container mx-auto px-4 space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="rounded-full bg-violet-500/10 text-violet-400 px-3.5 py-1.5 text-xs font-semibold border border-violet-500/20 uppercase tracking-wider">
                Platform Tour
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Built for flawless events.
              </h2>
              <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
                Everything you need to orchestrate and discover events in one unified, high-performance platform.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
              {/* Card 1: Interactive Event Discovery (col-span-2) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/40 p-8 flex flex-col justify-between min-h-[340px] md:col-span-2 hover:border-violet-500/30 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10 text-violet-400">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Discovery Pipeline</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Search, filter, and discover community meetups, tech workshops, and college fests with our intuitive category search layers.
                  </p>
                </div>
                
                {/* Mock Category UI */}
                <div className="mt-8 flex flex-wrap gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  {["Hackathons", "Tech Talks", "Music Fests", "Workshops", "Art Exhibits", "Sports"].map((cat, idx) => (
                    <span 
                      key={idx} 
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-default transition-all ${
                        idx === 0 
                          ? "bg-violet-600/20 text-violet-300 border-violet-500/30" 
                          : "bg-white/5 text-neutral-400 border-white/5 hover:border-white/15"
                      }`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Card 2: Digital Tickets (col-span-1) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/40 p-8 flex flex-col justify-between min-h-[340px] md:col-span-1 hover:border-fuchsia-500/30 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-fuchsia-500/10 text-fuchsia-400">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Premium Passes</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Export high-fidelity ticket images directly to your local library. Sleek layout compatible with mobile wallet formats.
                  </p>
                </div>

                {/* Mock Pass UI */}
                <div className="mt-8 relative h-24 bg-gradient-to-br from-violet-600/25 to-fuchsia-600/25 rounded-2xl border border-white/10 p-4 flex items-center justify-between overflow-hidden">
                  <div className="space-y-1 z-10">
                    <p className="text-[9px] font-bold text-violet-300 uppercase tracking-widest">Entry Ticket</p>
                    <p className="text-xs font-extrabold line-clamp-1">AI Workshop 2026</p>
                    <p className="text-[8px] text-neutral-400">ID: #8822-AD</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/5 z-10 backdrop-blur-xs">
                    <QrCode className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-violet-500/10 rounded-full blur-xl" />
                </div>
              </motion.div>

              {/* Card 3: RSVPs & Payments (col-span-1) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/40 p-8 flex flex-col justify-between min-h-[340px] md:col-span-1 hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Fast Checkouts</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Confirm RSVPs in a click. Secured payment processing pipeline integrated natively via Razorpay API.
                  </p>
                </div>

                {/* Mock Ticket checkout */}
                <div className="mt-8 bg-neutral-950 rounded-2xl border border-white/5 p-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-neutral-400">1x Admission Ticket</span>
                    <span className="font-bold">₹299.00</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-center text-[10px] font-bold text-violet-400">
                    <span>Payment Confirmed</span>
                    <span className="flex items-center gap-0.5">
                      <CheckCircle className="h-3 w-3" /> Paid
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Card 4: Dashboard Analytics (col-span-2) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/40 p-8 flex flex-col justify-between min-h-[340px] md:col-span-2 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">Real-time Metrics</h3>
                  <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
                    Access real-time check-in stats, payout timelines, and registration curves. Manage attendees efficiently on our unified interface.
                  </p>
                </div>

                {/* SVG curve line chart */}
                <div className="mt-8 h-20 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 20 L10 15 L20 18 L30 10 L40 12 L50 4 L60 8 L70 2 L80 5 L90 1 L100 0 L100 20 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M0 20 L10 15 L20 18 L30 10 L40 12 L50 4 L60 8 L70 2 L80 5 L90 1 L100 0"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute top-0 left-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold">
                    +42% attendance spike
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Showcase Section: Desktop Grid & Mobile Snap Carousel */}
        <section className="container mx-auto px-4 space-y-24">
          
          {/* Upcoming Events */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <Clock className="h-4 w-4" />
                  <span>Upcoming Highlights</span>
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">Happening Soon</h2>
              </div>
              <Button asChild variant="outline" className="rounded-full px-6 font-semibold cursor-pointer">
                <Link href="/events">Explore All</Link>
              </Button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="border border-dashed rounded-3xl p-12 text-center bg-muted/10">
                <p className="text-muted-foreground text-sm">No upcoming events scheduled. Stay tuned!</p>
              </div>
            ) : (
              /* Grid on Desktop / Snap swipe carousel on Mobile */
              <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible gap-6 md:gap-8 snap-x snap-mandatory md:snap-none scrollbar-none pb-4 md:pb-0 px-4 md:px-0 -mx-4 md:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {upcomingEvents.map((event: any) => {
                  const status = getEventStatus(event.starts_at, event.ends_at, event.status);
                  const regCount = event.event_registrations?.length ?? 0;
                  const occupancy = event.max_attendees
                    ? Math.round((regCount / event.max_attendees) * 100)
                    : null;

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group overflow-hidden rounded-3xl border bg-background transition-all hover:shadow-xl hover:border-primary/20 w-[290px] md:w-auto shrink-0 md:shrink snap-center md:snap-align-none"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={event.banner_url || "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1200"}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute left-4 top-4 flex gap-2">
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${getEventStatusClasses(status)}`}>
                            {status}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${event.is_paid ? "bg-blue-600 text-white" : "bg-white text-black"}`}>
                            {event.is_paid ? `₹${event.ticket_price}` : "Free"}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {event.organizations?.name}
                          </span>
                        </div>

                        <h3 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>

                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatEventDate(event.starts_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5" />
                            <span>
                              {regCount} / {event.max_attendees || "∞"} Registered
                              {occupancy !== null && <span className="ml-2 font-bold text-primary">({occupancy}% Full)</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trending Events */}
          <div className="space-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
                <TrendingUp className="h-4 w-4" />
                <span>Trending Now</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Most Popular Events</h2>
            </div>

            {trendingEvents.length === 0 ? (
              <div className="border border-dashed rounded-3xl p-12 text-center bg-muted/10">
                <p className="text-muted-foreground text-sm">No trending events right now.</p>
              </div>
            ) : (
              /* Grid on Desktop / Snap swipe carousel on Mobile */
              <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible gap-6 md:gap-8 snap-x snap-mandatory md:snap-none scrollbar-none pb-4 md:pb-0 px-4 md:px-0 -mx-4 md:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {trendingEvents.map((event: any) => {
                  const status = getEventStatus(event.starts_at, event.ends_at, event.status);
                  const regCount = event.event_registrations?.length ?? 0;

                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.slug}`}
                      className="group overflow-hidden rounded-3xl border bg-background transition-all hover:shadow-xl hover:border-blue-500/20 w-[290px] md:w-auto shrink-0 md:shrink snap-center md:snap-align-none"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={event.banner_url || "https://images.unsplash.com/photo-1540575861501-7ad0582371f3?q=80&w=1200"}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute left-4 top-4 flex gap-2">
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${getEventStatusClasses(status)}`}>
                            {status}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${event.is_paid ? "bg-blue-600 text-white" : "bg-white text-black"}`}>
                            {event.is_paid ? `₹${event.ticket_price}` : "Free"}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {event.organizations?.name}
                          </span>
                        </div>

                        <h3 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>

                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatEventDate(event.starts_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{event.venue || "Venue TBA"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {regCount} registrations
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Highlights */}
          <div className="space-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm uppercase tracking-wider">
                <History className="h-4 w-4" />
                <span>Past Highlights</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Memorable Hostings</h2>
            </div>

            {pastHighlights.length === 0 ? (
              <div className="border border-dashed rounded-3xl p-12 text-center bg-muted/10">
                <p className="text-muted-foreground text-sm">No completed events yet.</p>
              </div>
            ) : (
              /* Grid on Desktop / Snap swipe carousel on Mobile */
              <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-x-visible gap-6 md:gap-8 snap-x snap-mandatory md:snap-none scrollbar-none pb-4 md:pb-0 px-4 md:px-0 -mx-4 md:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {pastHighlights.map((event: any) => {
                  const regCount = event.event_registrations?.length ?? 0;
                  const eventDate = formatEventLongDate(event.starts_at);

                  return (
                    <div 
                      key={event.id}
                      className="rounded-3xl border bg-background/40 backdrop-blur-xs p-6 space-y-4 hover:shadow-md transition-all border-dashed w-[290px] md:w-auto shrink-0 md:shrink snap-center md:snap-align-none"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {event.organizations?.name}
                        </span>
                        <h3 className="font-bold text-lg line-clamp-1 text-card-foreground">
                          {event.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs border-t pt-4 border-muted/50">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{eventDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-primary">
                          <Users className="h-3.5 w-3.5" />
                          <span>{regCount} Attended</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-16 bg-muted/20">
        <div className="container mx-auto px-4 space-y-12">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold tracking-tight">Eventic</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                The next-generation event management and discovery platform. Find community fests, workshops, and fests happening near you.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/events" className="hover:text-primary transition-colors">Events</Link></li>
                <li><Link href={ROUTES.AUTH.LOGIN} className="hover:text-primary transition-colors">Login</Link></li>
                <li><Link href={ROUTES.AUTH.REGISTER} className="hover:text-primary transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-foreground">Legal & Help</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div>
              © 2026 Eventic. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-primary transition-colors">LinkedIn</Link>
              <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
