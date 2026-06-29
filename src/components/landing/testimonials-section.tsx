"use client";

import { motion } from "framer-motion";
import { Star, Quote, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion";

const testimonials = [
    {
        name: "Abhinav Sharma",
        role: "President, SVCE ACM Student Chapter",
        quote: "Eventic simplified our annual national hackathon completely. We registered over 800 students, gathered custom food preferences, and checked in everyone in under 15 minutes using volunteer scan codes.",
        stars: 5,
        avatarInitials: "AS"
    },
    {
        name: "Pooja Hegde",
        role: "Convener, College Cultural Fest",
        quote: "Selling paid tickets and managing cash payouts was always a headache. Eventic's Razorpay integration and automated ticket prefixes saved us weeks of manual reconciliation.",
        stars: 5,
        avatarInitials: "PH"
    },
    {
        name: "Karthik Raja",
        role: "Lead Developer, GDG Community",
        quote: "The volunteer scanner portal is a game changer. We gave scanner codes to our logistics team on the field, and they validated tickets offline and online without seeing sensitive admin details.",
        stars: 5,
        avatarInitials: "KR"
    }
];

export function TestimonialsSection() {
    return (
        <section className="container mx-auto px-6 py-28 relative">
            <div className="max-w-5xl mx-auto space-y-20">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm uppercase tracking-wider">
                        <Sparkles className="h-4 w-4" />
                        <span>User Reviews</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        Loved by event organizers.
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                        Here is what college student chapters, event managers, and developers say about their hosting experience on Eventic.
                    </p>
                </div>

                <motion.div 
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-8 md:grid-cols-3"
                >
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={idx}
                            variants={fadeInUp}
                            className="bg-card border rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative group"
                        >
                            <Quote className="absolute top-6 right-8 h-8 w-8 text-muted-foreground/10 group-hover:text-violet-500/10 transition-colors duration-300 pointer-events-none" />
                            
                            <div className="space-y-6">
                                <div className="flex gap-1">
                                    {[...Array(t.stars)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed italic">
                                    "{t.quote}"
                                </p>
                            </div>

                            <div className="flex items-center gap-4 border-t pt-6 mt-8">
                                <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-extrabold flex items-center justify-center text-sm border border-violet-500/10">
                                    {t.avatarInitials}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground leading-none">{t.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
