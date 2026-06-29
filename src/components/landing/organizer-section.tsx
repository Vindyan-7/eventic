"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { Sparkles, CalendarRange, TicketCheck, BarChart3, ScanFace, FileSpreadsheet, KeyRound } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion";

interface OrganizerSectionProps {
    user: any;
}

const tools = [
    { icon: CalendarRange, label: "Event Builder" },
    { icon: TicketCheck, label: "Easy Ticketing" },
    { icon: BarChart3, label: "Advanced Analytics" },
    { icon: ScanFace, label: "Camera QR Scanner" },
    { icon: KeyRound, label: "Volunteer Scanner Accounts" },
    { icon: FileSpreadsheet, label: "Excel & CSV Exports" }
];

export function OrganizerSection({ user }: OrganizerSectionProps) {
    return (
        <section className="py-28 bg-neutral-950 text-white border-b border-white/5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,rgba(124,58,237,0.06),transparent_80%)] pointer-events-none z-0" />
            <div className="container mx-auto px-6 space-y-16 relative z-10">
                <motion.div 
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-4xl mx-auto text-center space-y-6"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/20 tracking-wider uppercase mb-2">
                        <Sparkles className="h-3.5 w-3.5" /> For Event Hosts
                    </motion.div>

                    <motion.h2 
                        variants={fadeInUp}
                        className="text-4xl md:text-6xl font-black tracking-tight"
                    >
                        Host events without the headache.
                    </motion.h2>

                    <motion.p 
                        variants={fadeInUp}
                        className="text-neutral-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base"
                    >
                        Set up custom checkout forms, sell paid or free admissions, track sales graphs, and equip volunteers with standalone scanner dashboards.
                    </motion.p>
                </motion.div>

                {/* Grid of features */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {tools.map((tool, idx) => {
                        const Icon = tool.icon;
                        return (
                            <div 
                                key={idx}
                                className="flex items-center gap-3.5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/8 transition-all hover:border-white/10"
                            >
                                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-semibold text-neutral-200">{tool.label}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center pt-4">
                    {user ? (
                        <Button 
                            asChild 
                            size="lg"
                            className="h-14 px-8 rounded-2xl text-base font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 shadow-lg shadow-violet-500/25 cursor-pointer text-white"
                        >
                            <Link href="/org/create">Create Organization</Link>
                        </Button>
                    ) : (
                        <Button 
                            asChild 
                            size="lg"
                            className="h-14 px-8 rounded-2xl text-base font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 shadow-lg shadow-violet-500/25 cursor-pointer text-white"
                        >
                            <Link href={ROUTES.AUTH.REGISTER}>Get Started as Organizer</Link>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
