"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        q: "How do tickets work on Eventic?",
        a: "Every registration generates a secure, cryptographically signed ticket with a readable prefix (e.g. SVCE-2026-0001) and a unique QR code. Attendees can view tickets in their dashboard or download them to show at the entry gate."
    },
    {
        q: "Can I host paid events and collect payments?",
        a: "Yes, Eventic integrates natively with Razorpay for secure checkout processing. Organizers can define ticket pricing (in INR) during creation, and payouts are automatically processed to their configured bank accounts."
    },
    {
        q: "How do QR check-ins work?",
        a: "Event hosts can use their laptop/mobile camera to scan ticket QR codes directly from the browser. Additionally, hosts can generate temporary 6-digit access codes for volunteer staff to scan tickets at entry checkpoints without granting full admin rights."
    },
    {
        q: "Can I customize the registration forms?",
        a: "Absolutely. Eventic has a Google Forms style builder. Organizers can add custom registration fields such as text inputs, dropdown selections, checkboxes, and number fields. Attendee responses are visible directly inside the event admin dashboard."
    }
];

function FAQItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
    return (
        <div className="border-b border-border last:border-0 py-5">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between text-left font-bold text-base md:text-lg text-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200 cursor-pointer"
            >
                <span>{q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180 text-violet-500" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pt-3 text-muted-foreground text-sm leading-relaxed max-w-3xl">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="container mx-auto px-6 py-28 relative">
            <div className="max-w-4xl mx-auto space-y-16">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm uppercase tracking-wider">
                        <Sparkles className="h-4 w-4" />
                        <span>Faq</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                        Have queries about ticket codes, check-ins, or custom forms? Find quick answers here.
                    </p>
                </div>

                <div className="border rounded-[2rem] p-6 md:p-10 bg-card/30 backdrop-blur-xs">
                    {faqs.map((faq, idx) => (
                        <FAQItem
                            key={idx}
                            q={faq.q}
                            a={faq.a}
                            isOpen={openIndex === idx}
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
