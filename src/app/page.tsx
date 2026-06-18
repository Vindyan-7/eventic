"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { ArrowRight, Sparkles, Zap, Shield, Globe, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Eventic</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href={ROUTES.PUBLIC.EVENTS} className="text-sm font-medium hover:text-primary transition-colors">Events</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href={ROUTES.AUTH.LOGIN}>Login</Link>
            </Button>
            <Button asChild className="rounded-full px-6">
              <Link href={ROUTES.AUTH.REGISTER}>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
            <div className="absolute top-[-10%] left-[10%] w-[40%] h-[60%] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-4">
            <motion.div
              variants={staggerContainer}
              initial={isMounted ? "initial" : "animate"}
              animate="animate"
              className="max-w-4xl mx-auto text-center space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                  <Sparkles className="h-4 w-4" /> Next-gen Event Management
                </span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                  Elevate Your <span className="text-gradient">Experience</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  The all-in-one platform for creators and organizations to build, grow, and manage unforgettable events at scale.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg gap-2" asChild>
                  <Link href={ROUTES.AUTH.REGISTER}>
                    Create Event <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg" asChild>
                  <Link href={ROUTES.PUBLIC.EVENTS}>Discover Events</Link>
                </Button>
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: Zap, label: "Fast & Scalable" },
                  { icon: Shield, label: "Secure Payments" },
                  { icon: Globe, label: "Global Reach" },
                  { icon: Users, label: "Community Driven" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 bg-muted-foreground/20 rounded flex items-center justify-center">
              <span className="text-muted-foreground font-bold text-xs">E</span>
            </div>
            <span className="font-semibold">Eventic</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2026 Eventic. Built with passion for event creators.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Twitter</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">LinkedIn</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

