import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { getCurrentProfile } from "@/services/profile";
import { getPublishedEvents } from "@/services/public-events";

import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturedEventsCarousel } from "@/components/landing/featured-events-carousel";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { OrganizerSection } from "@/components/landing/organizer-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { SponsorsSection } from "@/components/landing/sponsors-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FooterSection } from "@/components/landing/footer-section";

// Server-side Metadata for SEO and search engine indexing
export const metadata = {
  title: "Eventic - Discover & Host Events Seamlessly",
  description: "The next-generation event management and discovery platform. Find community fests, technical hackathons, workshops, and meetups near you.",
};

export default async function HomePage() {
  const profile = await getCurrentProfile();
  const events = await getPublishedEvents();

  return (
    <div className="flex flex-col min-h-screen bg-background antialiased">
      {/* Glassmorphic Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Eventic</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {profile ? (
              <Button asChild className="rounded-full px-6 cursor-pointer bg-primary text-primary-foreground">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="cursor-pointer">
                  <Link href={ROUTES.AUTH.LOGIN}>Login</Link>
                </Button>
                <Button asChild className="rounded-full px-6 cursor-pointer bg-primary text-primary-foreground">
                  <Link href={ROUTES.AUTH.REGISTER}>Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Landing V2 Page Composition */}
      <main className="flex-1 pt-16">
        {/* 1. Hero Spotlight Section */}
        <HeroSection user={profile} />

        {/* 2. Platform Statistics Section */}
        <StatsSection />

        {/* 3. Featured Events Carousel */}
        <FeaturedEventsCarousel events={events || []} />

        {/* 4. Infinite Horizontal scrolling logos */}
        <SponsorsSection />

        {/* 5. Platform Core Features ( Bento Grid ) */}
        <FeaturesSection />

        {/* 6. Three-step interactive workflow map */}
        <HowItWorksSection />

        {/* 7. Organizer Hostings Proposition Section */}
        <OrganizerSection user={profile} />

        {/* 8. Testimonials Section */}
        <TestimonialsSection />

        {/* 9. FAQ accordion */}
        <FAQSection />
      </main>

      {/* 10. Unified Footer */}
      <FooterSection />
    </div>
  );
}
