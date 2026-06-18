import React from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md p-4 relative z-10">
                <div className="bg-background/80 backdrop-blur-xl border rounded-2xl shadow-2xl p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                            <span className="text-primary-foreground font-bold text-2xl">E</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Eventic</h1>
                        <p className="text-muted-foreground text-sm">Welcome back</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
