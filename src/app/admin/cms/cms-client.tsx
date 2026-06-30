"use client";

import { useState, useTransition } from "react";
import { AdminHeader } from "@/components/admin/ui";
import { updateCmsConfig } from "@/app/admin/actions";
import { toast } from "sonner";
import { LayoutGrid, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CmsClient({ initialConfig }: { initialConfig: any }) {
  const [heroHeading, setHeroHeading] = useState(initialConfig.hero_heading || "");
  const [heroSubheading, setHeroSubheading] = useState(initialConfig.hero_subheading || "");
  const [ctaText, setCtaText] = useState(initialConfig.cta_text || "");

  // Statistics
  const [stats, setStats] = useState<any[]>(initialConfig.stats_data || []);
  // FAQ
  const [faqs, setFaqs] = useState<any[]>(initialConfig.faq_data || []);
  // Testimonials
  const [testimonials, setTestimonials] = useState<any[]>(initialConfig.testimonials_data || []);
  // Sponsors
  const [sponsors, setSponsors] = useState<any[]>(initialConfig.sponsors_data || []);

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateCmsConfig({
          hero_heading: heroHeading,
          hero_subheading: heroSubheading,
          cta_text: ctaText,
          stats_data: stats,
          faq_data: faqs,
          testimonials_data: testimonials,
          sponsors_data: sponsors,
          footer_links: []
        });
        toast.success("CMS configurations saved successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to update configurations");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      <div className="flex justify-between items-center">
        <AdminHeader
          title="Homepage CMS Configurator"
          description="Control content variables on the main landing page without code deployments"
        />
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-white text-black hover:bg-neutral-200 font-extrabold gap-1.5 cursor-pointer rounded-xl h-10 px-4"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 text-xs">
        {/* HERO SECTION CONFIG */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> Hero Banner
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold block">Hero Heading</label>
              <input
                type="text"
                value={heroHeading}
                onChange={e => setHeroHeading(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold block">Hero Subheading</label>
              <textarea
                value={heroSubheading}
                onChange={e => setHeroSubheading(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-neutral-400 font-bold block">CTA Action Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={e => setCtaText(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-neutral-700"
              />
            </div>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Homepage Statistics</h3>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setStats([...stats, { label: "Events", value: "500+" }])}
              className="text-white hover:bg-neutral-900 gap-1 rounded-lg border-neutral-850 h-8"
            >
              <Plus className="h-3 w-3" /> Add Stat
            </Button>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {stats.map((s, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Value (e.g. 50+)"
                  value={s.value}
                  onChange={e => {
                    const next = [...stats];
                    next[idx].value = e.target.value;
                    setStats(next);
                  }}
                  className="w-1/3 h-9 px-3 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={s.label}
                  onChange={e => {
                    const next = [...stats];
                    next[idx].label = e.target.value;
                    setStats(next);
                  }}
                  className="flex-1 h-9 px-3 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-white outline-none"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setStats(stats.filter((_, i) => i !== idx))}
                  className="size-9 text-neutral-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* SPONSORS TICKER */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Sponsor Partnerships</h3>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setSponsors([...sponsors, { name: "", logo_url: "" }])}
              className="text-white hover:bg-neutral-900 gap-1 rounded-lg border-neutral-850 h-8"
            >
              <Plus className="h-3 w-3" /> Add Partner
            </Button>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {sponsors.map((sp, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Partner Name"
                  value={sp.name}
                  onChange={e => {
                    const next = [...sponsors];
                    next[idx].name = e.target.value;
                    setSponsors(next);
                  }}
                  className="w-1/2 h-9 px-3 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Logo URL (optional)"
                  value={sp.logo_url}
                  onChange={e => {
                    const next = [...sponsors];
                    next[idx].logo_url = e.target.value;
                    setSponsors(next);
                  }}
                  className="flex-1 h-9 px-3 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-white outline-none"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSponsors(sponsors.filter((_, i) => i !== idx))}
                  className="size-9 text-neutral-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Social Proof Testimonials</h3>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setTestimonials([...testimonials, { name: "", role: "", quote: "" }])}
              className="text-white hover:bg-neutral-900 gap-1 rounded-lg border-neutral-850 h-8"
            >
              <Plus className="h-3 w-3" /> Add Quote
            </Button>
          </div>
          <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-3 border border-neutral-900 bg-neutral-900/30 rounded-2xl space-y-2 relative">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setTestimonials(testimonials.filter((_, i) => i !== idx))}
                  className="absolute right-2 top-2 size-8 text-neutral-500 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <div className="grid grid-cols-2 gap-2 pr-8">
                  <input
                    type="text"
                    placeholder="User Name"
                    value={t.name}
                    onChange={e => {
                      const next = [...testimonials];
                      next[idx].name = e.target.value;
                      setTestimonials(next);
                    }}
                    className="h-9 px-3 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Role / Title"
                    value={t.role}
                    onChange={e => {
                      const next = [...testimonials];
                      next[idx].role = e.target.value;
                      setTestimonials(next);
                    }}
                    className="h-9 px-3 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-white outline-none"
                  />
                </div>
                <textarea
                  placeholder="Feedback quote text..."
                  value={t.quote}
                  onChange={e => {
                    const next = [...testimonials];
                    next[idx].quote = e.target.value;
                    setTestimonials(next);
                  }}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-white outline-none resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 space-y-4 xl:col-span-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Frequently Asked Questions</h3>
            <Button
              size="xs"
              variant="outline"
              onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
              className="text-white hover:bg-neutral-900 gap-1 rounded-lg border-neutral-850 h-8"
            >
              <Plus className="h-3 w-3" /> Add FAQ
            </Button>
          </div>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {faqs.map((f, idx) => (
              <div key={idx} className="p-3 border border-neutral-900 bg-neutral-900/30 rounded-2xl space-y-2 relative">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                  className="absolute right-2 top-2 size-8 text-neutral-500 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <input
                  type="text"
                  placeholder="Question title"
                  value={f.question}
                  onChange={e => {
                    const next = [...faqs];
                    next[idx].question = e.target.value;
                    setFaqs(next);
                  }}
                  className="w-11/12 h-9 px-3 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-white outline-none font-bold"
                />
                <textarea
                  placeholder="Answer detail..."
                  value={f.answer}
                  onChange={e => {
                    const next = [...faqs];
                    next[idx].answer = e.target.value;
                    setFaqs(next);
                  }}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-neutral-800 bg-neutral-900 text-xs text-white outline-none resize-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
