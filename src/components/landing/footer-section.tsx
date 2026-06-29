"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function FooterSection() {
    return (
        <footer className="border-t py-20 bg-muted/10">
            <div className="container mx-auto px-6 space-y-16">
                <div className="grid gap-10 grid-cols-2 md:grid-cols-4 max-w-6xl mx-auto">
                    <div className="col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-lg">E</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">Eventic</span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                            The next-generation event management and discovery platform. Find college fests, technical workshops, and community meetups happening near you.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-foreground">Platform</h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li><Link href="/events" className="hover:text-violet-500 transition-colors">Find Events</Link></li>
                            <li><Link href={ROUTES.AUTH.LOGIN} className="hover:text-violet-500 transition-colors">Sign In</Link></li>
                            <li><Link href={ROUTES.AUTH.REGISTER} className="hover:text-violet-500 transition-colors">Host an Event</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-foreground">Legal & Help</h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-violet-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-violet-500 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-violet-500 transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 max-w-6xl mx-auto text-xs text-muted-foreground">
                    <div>
                        © {new Date().getFullYear()} Eventic. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                            <span>Instagram</span>
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764.784 1.764 1.75 1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            <span>LinkedIn</span>
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                            <span>GitHub</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
