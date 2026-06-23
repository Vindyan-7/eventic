"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadTicketButtonProps {
    registrationId: string;
    eventName: string;
    orgName: string;
    venue: string;
    startDate: string;
    endDate: string | null;
    attendeeName: string;
    qrCode: string; // data URL
    bannerUrl: string;
    eventStatus: string;
}

export function DownloadTicketButton({
    registrationId,
    eventName,
    orgName,
    venue,
    startDate,
    endDate,
    attendeeName,
    qrCode,
    bannerUrl,
    eventStatus,
}: DownloadTicketButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            
            const html2canvas = (await import("html2canvas-pro")).default;

            const element = document.getElementById(`image-ticket-${registrationId}`);
            if (!element) {
                toast.error("Ticket template not found");
                setIsDownloading(false);
                return;
            }

            // Capture the element using html2canvas
            const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: false,
                scale: 3, // High resolution for crisp QR code
                logging: false,
                backgroundColor: "#ffffff",
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `ticket-${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                    toast.success("Ticket downloaded successfully!");
                    setIsDownloading(false);
                } else {
                    // Fallback to toDataURL if toBlob fails
                    try {
                        const imgData = canvas.toDataURL("image/png");
                        const link = document.createElement("a");
                        link.href = imgData;
                        link.download = `ticket-${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Ticket downloaded successfully!");
                    } catch (err) {
                        console.error("toDataURL fallback failed:", err);
                        toast.error("Failed to generate ticket image");
                    }
                    setIsDownloading(false);
                }
            }, "image/png");

        } catch (error) {
            console.error("Image generation failed:", error);
            toast.error("Failed to generate ticket image. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const startDateTime = new Date(startDate);
    const formattedDate = startDateTime.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const formattedTime = startDateTime.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    });

    return (
        <>
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-black text-white px-5 py-3 font-semibold hover:bg-black/90 transition-colors disabled:opacity-50"
            >
                {isDownloading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating Ticket...
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4" />
                        Download Ticket
                    </>
                )}
            </button>

            {/* Hidden Ticket DOM Element for Capture */}
            <div className="absolute pointer-events-none opacity-0 overflow-hidden h-0 w-0">
                <div
                    id={`image-ticket-${registrationId}`}
                    className="w-[450px] bg-white text-black p-0 font-sans border border-gray-200 rounded-3xl overflow-hidden shadow-2xl"
                    style={{ boxSizing: "border-box" }}
                >
                    {/* Event Banner */}
                    <div className="relative w-full h-[220px] bg-gradient-to-br from-neutral-800 to-neutral-950 overflow-hidden">
                        {bannerUrl ? (
                            <img
                                src={bannerUrl}
                                alt={eventName}
                                className="w-full h-full object-cover opacity-80"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                }}
                            />
                        ) : null}
                        
                        {/* Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {eventStatus}
                        </div>
                        
                        {/* Org Name */}
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white/90">
                            {orgName}
                        </div>

                        {/* Title */}
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-primary/80">Digital Pass</span>
                            <h1 className="text-2xl font-extrabold text-white mt-1 leading-tight tracking-tight">{eventName}</h1>
                        </div>
                    </div>

                    {/* Body Details */}
                    <div className="p-6 bg-white space-y-6">
                        <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Attendee</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{attendeeName}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Venue</span>
                                <p className="text-sm font-bold text-gray-900 mt-1 break-words">{venue}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Date</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{formattedDate}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Time</span>
                                <p className="text-sm font-bold text-gray-900 mt-1">{formattedTime}</p>
                            </div>
                        </div>

                        {/* QR Code and Registration ID footer */}
                        <div className="border-t border-dashed pt-6 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                            <img
                                src={qrCode}
                                alt="QR Code"
                                className="w-[170px] h-[170px] border p-2 bg-white rounded-2xl shadow-sm"
                            />
                            
                            <div className="mt-4 text-center w-full max-w-[280px]">
                                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Registration ID</span>
                                <p className="text-[11px] font-mono font-bold text-gray-700 mt-1 break-all bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-2xs">
                                    {registrationId}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card Footer branding */}
                    <div className="bg-black text-white py-3 text-center text-[10px] font-medium tracking-wider flex items-center justify-center gap-1.5">
                        <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
                            <span className="text-black font-extrabold text-[10px]">E</span>
                        </div>
                        <span>POWERED BY EVENTIC</span>
                    </div>
                </div>
            </div>
        </>
    );
}
