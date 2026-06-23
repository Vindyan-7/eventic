"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, MessageSquare, Send, Mail, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShareTicketButtonProps {
    registrationId: string;
    eventName: string;
}

export function ShareTicketButton({ registrationId, eventName }: ShareTicketButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const ticketLink = typeof window !== "undefined" 
        ? `${window.location.origin}/tickets/${registrationId}`
        : "";

    const shareText = `Here is my ticket for ${eventName}!`;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleShareClick = async () => {
        setIsSharing(true);
        try {
            // First try to check if file sharing is possible
            const html2canvas = (await import("html2canvas-pro")).default;
            const element = document.getElementById(`image-ticket-${registrationId}`);
            
            if (element && navigator.canShare) {
                const canvas = await html2canvas(element, {
                    useCORS: true,
                    allowTaint: false,
                    scale: 3,
                    logging: false,
                    backgroundColor: "#ffffff",
                });
                
                const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
                
                if (blob) {
                    const file = new File(
                        [blob], 
                        `ticket-${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`, 
                        { type: "image/png" }
                    );
                    
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: `Ticket for ${eventName}`,
                            text: shareText,
                        });
                        toast.success("Ticket shared successfully!");
                        setIsSharing(false);
                        return;
                    }
                }
            }

            // Fallback 1: Text-only native sharing
            if (navigator.share) {
                await navigator.share({
                    title: `Ticket for ${eventName}`,
                    text: shareText,
                    url: ticketLink,
                });
                toast.success("Shared successfully!");
                setIsSharing(false);
                return;
            }

            // Fallback 2: Show dropdown on desktop
            setIsOpen(!isOpen);
        } catch (error) {
            console.error("Sharing failed:", error);
            if (error instanceof Error && error.name !== "AbortError") {
                toast.error("Failed to share ticket");
            }
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(ticketLink);
            setCopied(true);
            toast.success("Ticket link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
        setIsOpen(false);
    };

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + ticketLink)}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(ticketLink)}&text=${encodeURIComponent(shareText)}`;
    const smsUrl = `sms:?body=${encodeURIComponent(shareText + " " + ticketLink)}`;
    const mailUrl = `mailto:?subject=${encodeURIComponent(`Ticket for ${eventName}`)}&body=${encodeURIComponent(shareText + "\n\n" + ticketLink)}`;

    return (
        <div className="relative inline-block w-full sm:w-auto" ref={dropdownRef}>
            <button
                onClick={handleShareClick}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-3 font-semibold hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
                {isSharing ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing Share...
                    </>
                ) : (
                    <>
                        <Share2 className="h-4 w-4" />
                        Share Ticket
                    </>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 bottom-full mb-2 z-50 w-56 rounded-xl border bg-popover p-2 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                        Share ticket via:
                    </div>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted transition-colors"
                    >
                        <span className="w-5 h-5 rounded bg-green-500 text-white flex items-center justify-center text-xs font-bold">W</span>
                        WhatsApp
                    </a>
                    <a
                        href={telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted transition-colors"
                    >
                        <Send className="w-4 h-4 text-sky-500" />
                        Telegram
                    </a>
                    <a
                        href={smsUrl}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted transition-colors"
                    >
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        Messages (SMS)
                    </a>
                    <a
                        href={mailUrl}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted transition-colors"
                    >
                        <Mail className="w-4 h-4 text-blue-500" />
                        Mail
                    </a>
                    <hr className="my-1 border-muted" />
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted transition-colors text-left"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        Copy Link
                    </button>
                </div>
            )}
        </div>
    );
}
