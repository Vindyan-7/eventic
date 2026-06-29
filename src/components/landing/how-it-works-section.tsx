"use client";

import { motion } from "framer-motion";
import { Search, Compass, QrCode, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const steps = [
    {
        number: "01",
        icon: Compass,
        title: "Discover Event",
        description: "Browse curated community hackathons, college symposia, workshops, and meetups happening in your vicinity."
    },
    {
        number: "02",
        icon: Search, // Wait, ticket/registration is better
        title: "Register & Get Ticket",
        description: "Fill out custom registration forms, confirm checkouts via Razorpay, and download dynamic pass keys to your dashboard."
    },
    {
        number: "03",
        icon: QrCode,
        title: "Scan & Attend",
        description: "Present your secure QR ticket at the registration desk. Staff scanners verify details instantly via check-in terminals."
    }
];

export function HowItWorksSection() {
    return (
        <section className="container mx-auto px-6 py-28 relative">
            <div className="max-w-5xl mx-auto space-y-20">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm uppercase tracking-wider">
                        <Sparkles className="h-4 w-4" />
                        <span>Workflow Pipeline</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        Getting started is simple.
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                        From discovery to entry gates, Eventic orchestrates a seamless check-in pipeline for attendees and organizers alike.
                    </p>
                </div>

                <motion.div 
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-12 md:grid-cols-3 relative"
                >
                    {/* Connecting dashed line for Desktop */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 border-t border-dashed border-border/80 -translate-y-1/2 z-0" />

                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={idx}
                                variants={fadeInUp}
                                className="relative bg-background border rounded-[2rem] p-8 space-y-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 z-10"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center border border-violet-500/10">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-3xl font-black text-violet-500/20 tracking-wider">
                                            {step.number}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-extrabold text-lg text-foreground">
                                            {step.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
