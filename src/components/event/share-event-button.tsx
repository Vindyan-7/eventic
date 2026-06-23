"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareEventButtonProps {
    title: string;
    description: string;
}

export function ShareEventButton({ title, description }: ShareEventButtonProps) {
    const handleShare = async () => {
        const url = window.location.href;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: description || undefined,
                    url: url,
                });
                toast.success("Shared successfully!");
            } catch (error) {
                // Do not show error toast if the user cancelled the share operation
                console.error("Error sharing:", error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Event link copied to clipboard!");
            } catch (error) {
                toast.error("Failed to copy link.");
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
        >
            <Share2 className="h-4 w-4" />
            Share Event
        </button>
    );
}
