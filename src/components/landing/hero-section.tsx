"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { ArrowRight, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion";

interface HeroSectionProps {
    user: any;
}

export function HeroSection({ user }: HeroSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            container.style.setProperty("--mouse-x", `${x}px`);
            container.style.setProperty("--mouse-y", `${y}px`);
        };

        container.addEventListener("mousemove", handleMouseMove);
        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden border-b bg-neutral-950 text-white"
            style={{
                "--mouse-x": "50%",
                "--mouse-y": "50%",
            } as React.CSSProperties}
        >
            {/* Dark premium grids & ambient lights */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_0px,rgba(124,58,237,0.15),transparent_80%)] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_100%,rgba(99,102,241,0.05),transparent_80%)] pointer-events-none z-0" />
            
            {/* Spotlight hover effect (visible on desktop hover) */}
            <div 
                className="absolute inset-0 opacity-0 md:group-hover/hero:opacity-100 lg:group-hover/hero:opacity-100 transition-opacity duration-700 pointer-events-none z-10"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(124, 58, 237, 0.12), transparent 80%)`
                }}
            />
            
            {/* Grid overlay pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)]" />

            <div className="container mx-auto px-6 py-20 relative z-20 text-center">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold border border-violet-500/20 tracking-wider uppercase mb-2 shadow-inner">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Where Communities Assemble
                    </motion.div>

                    <motion.h1 
                        variants={fadeInUp}
                        className="text-5xl md:text-8xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-400"
                    >
                        Discover & Host <br />
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Events Seamlessly</span>
                    </motion.h1>

                    <motion.p 
                        variants={fadeInUp}
                        className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Discover workshops, hackathons, and campus events happening around your college or community. Find nearby events and register in seconds.
                    </motion.p>

                    <motion.div 
                        variants={fadeInUp} 
                        className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
                    >
                        <Button 
                            asChild
                            size="lg" 
                            className="h-14 px-10 rounded-2xl text-base font-extrabold gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 w-full sm:w-auto text-white cursor-pointer"
                        >
                            <Link href="/events">
                                Find Nearby Events <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                        
                        {user ? (
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 rounded-2xl text-base font-bold border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto transition-all cursor-pointer"
                            >
                                <Link href="/dashboard">Go to Dashboard</Link>
                            </Button>
                        ) : (
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 rounded-2xl text-base font-bold border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto transition-all cursor-pointer"
                            >
                                <Link href={ROUTES.AUTH.REGISTER}>Host an Event</Link>
                            </Button>
                        )}
                    </motion.div>
                </motion.div>
            </div>
            
            {/* Animated particles */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>
    );
}
