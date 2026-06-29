"use client";

import { motion } from "framer-motion";
import { QrCode, Zap, ClipboardList, ShieldAlert, BarChart3, Smartphone, ArrowUpRight } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const features = [
    {
        icon: QrCode,
        title: "QR Ticket Entry",
        description: "Instant pass validation via cryptographically signed ticket codes, sent directly to user dashboards and email confirmation receipts.",
        colorClass: "text-violet-500 bg-violet-500/10 border-violet-500/20",
        hoverBorder: "hover:border-violet-500/30",
        size: "md:col-span-1"
    },
    {
        icon: Zap,
        title: "Instant Check-In",
        description: "Zero-latency check-ins for attendees. Staff scanners check-in entries in milliseconds via automated QR detection feeds.",
        colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        hoverBorder: "hover:border-amber-500/30",
        size: "md:col-span-1"
    },
    {
        icon: ClipboardList,
        title: "Custom Questionnaires",
        description: "Tailor checkout forms dynamically. Support for options, select values, checklist values, and text input configurations per event.",
        colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        hoverBorder: "hover:border-blue-500/30",
        size: "md:col-span-1"
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description: "Granular breakdown of event metrics. Deep-dive into registration velocity curves, check-in timelines, category maps, and student ratios.",
        colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        hoverBorder: "hover:border-emerald-500/30",
        size: "md:col-span-2"
    },
    {
        icon: ShieldAlert,
        title: "Secure Checkout pipeline",
        description: "Payments processed natively via Razorpay API overlays. Secure payouts directly back to bank accounts.",
        colorClass: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        hoverBorder: "hover:border-rose-500/30",
        size: "md:col-span-1"
    },
    {
        icon: Smartphone,
        title: "Mobile Volunteer Scanner",
        description: "Deploy check-in desks in seconds. Generate temporary 6-digit access codes for volunteers to scan tickets securely without full admin panel access.",
        colorClass: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        hoverBorder: "hover:border-indigo-500/30",
        size: "md:col-span-3"
    }
];

export function FeaturesSection() {
    return (
        <section className="py-28 bg-neutral-950 text-white border-y border-white/5 relative">
            {/* Soft lights */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 space-y-20 relative z-10">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <span className="rounded-full bg-violet-500/10 text-violet-400 px-4 py-1.5 text-xs font-bold border border-violet-500/20 uppercase tracking-widest">
                        Why Eventic
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        Built for flawless event execution.
                    </h2>
                    <p className="text-neutral-400 leading-relaxed text-base md:text-lg">
                        Everything you need to host, manage, and discover events in one unified, high-performance community engine.
                    </p>
                </div>

                <motion.div 
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto"
                >
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={idx}
                                variants={fadeInUp}
                                className={`group relative overflow-hidden rounded-[2rem] border border-white/5 bg-neutral-900/30 p-8 md:p-10 flex flex-col justify-between min-h-[300px] transition-all duration-300 ${feature.hoverBorder} ${feature.size}`}
                            >
                                <div className="space-y-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feature.colorClass}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold flex items-center gap-1.5">
                                            {feature.title}
                                        </h3>
                                        <p className="text-neutral-400 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <span className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:bg-white/10 transition-all duration-300">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
