"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

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

    return <span ref={ref} className="font-black text-foreground">0{suffix}</span>;
}

export function StatsSection() {
    return (
        <section className="container mx-auto px-6 py-12 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto border border-border/80 rounded-[2rem] p-8 md:p-12 bg-card/40 backdrop-blur-md shadow-xs">
                <div className="text-center space-y-2 border-r border-border/40 last:border-0 pr-2">
                    <p className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        <CountUp to={25000} suffix="+" />
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        Tickets Issued
                    </p>
                </div>
                <div className="text-center space-y-2 md:border-r border-border/40 last:border-0 pr-2">
                    <p className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        <CountUp to={540} suffix="+" />
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        Events Hosted
                    </p>
                </div>
                <div className="text-center space-y-2 border-r border-border/40 last:border-0 pr-2">
                    <p className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        <CountUp to={98} suffix="%" />
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        Check-in Rate
                    </p>
                </div>
                <div className="text-center space-y-2 last:border-0 pr-2">
                    <p className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        <CountUp to={180} suffix="+" />
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        Organizers
                    </p>
                </div>
            </div>
        </section>
    );
}
