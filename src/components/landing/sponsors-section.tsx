"use client";

const sponsors = [
    "ACM SVCE", "GDG Chennai", "CSI Chapter", "IEEE SVCE", "Rotaract Club",
    "TEDx SVCE", "CADD Centre", "GitHub Campus", "Red Bull India", "Tech Syndicate"
];

export function SponsorsSection() {
    return (
        <section className="py-16 bg-neutral-950 border-y border-white/5 overflow-hidden relative">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .marquee-container {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
                .marquee-container:hover {
                    animation-play-state: paused;
                }
            `}} />

            <div className="container mx-auto px-6 mb-8 text-center">
                <p className="text-[10px] md:text-xs text-neutral-400 font-extrabold uppercase tracking-widest opacity-80">
                    Trusted by top college clubs & chapters
                </p>
            </div>

            <div className="relative w-full flex items-center">
                {/* Gradients on sides for fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none" />

                <div className="marquee-container gap-12 md:gap-16">
                    {/* Double the array to make infinite loop work seamlessly */}
                    {[...sponsors, ...sponsors].map((sponsor, idx) => (
                        <div
                            key={idx}
                            className="text-neutral-400 hover:text-white transition-colors duration-300 text-lg md:text-2xl font-black tracking-widest uppercase py-2 cursor-default select-none shrink-0"
                        >
                            {sponsor}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
