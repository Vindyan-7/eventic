"use client";

import { useState } from "react";
import { updateEvent } from "@/services/events";
import { BannerUpload } from "./banner-upload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

interface EditEventFormProps {
    event: {
        id: string;
        title: string;
        description: string | null;
        venue: string | null;
        starts_at: string;
        ends_at: string | null;
        is_paid: boolean;
        ticket_price: number;
        banner_url: string | null;
        max_attendees: number | null;
        category: string | null;
        status?: string;
    };
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            className="w-full"
            disabled={pending}
        >
            {pending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
        </Button>
    );
}

export function EditEventForm({
    event,
}: EditEventFormProps) {
    const [preview, setPreview] =
        useState<string | null>(
            event.banner_url
        );

    async function handleUpdateEvent(
        formData: FormData
    ) {
        await updateEvent(
            event.id,
            formData
        );
    }

    return (
        <form
            action={handleUpdateEvent}
            className="space-y-6"
        >
            <BannerUpload
                preview={preview}
                setPreview={setPreview}
                setFile={() => { }}
            />

            <div className="space-y-2">
                <Label htmlFor="title">
                    Event Title
                </Label>

                <Input
                    id="title"
                    name="title"
                    defaultValue={event.title}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">
                    Category
                </Label>

                <select
                    id="category"
                    name="category"
                    defaultValue={event.category ?? ""}
                    className="w-full rounded-xl border p-3 bg-background"
                    required
                >
                    <option value="">
                        Select Category
                    </option>

                    <option value="Technology">
                        Technology
                    </option>

                    <option value="Hackathon">
                        Hackathon
                    </option>

                    <option value="Workshop">
                        Workshop
                    </option>

                    <option value="Seminar">
                        Seminar
                    </option>

                    <option value="Conference">
                        Conference
                    </option>

                    <option value="Startup">
                        Startup
                    </option>

                    <option value="Networking">
                        Networking
                    </option>

                    <option value="Cultural">
                        Cultural
                    </option>

                    <option value="Sports">
                        Sports
                    </option>

                    <option value="Music">
                        Music
                    </option>

                    <option value="Gaming">
                        Gaming
                    </option>

                    <option value="College Fest">
                        College Fest
                    </option>

                    <option value="Competition">
                        Competition
                    </option>

                    <option value="Webinar">
                        Webinar
                    </option>

                    <option value="Other">
                        Other
                    </option>
                </select>
            </div>


            <div className="space-y-2">
                <Label htmlFor="description">
                    Description
                </Label>

                <Textarea
                    id="description"
                    name="description"
                    rows={5}
                    defaultValue={
                        event.description ?? ""
                    }
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="venue">
                    Venue / Location
                </Label>

                <Input
                    id="venue"
                    name="venue"
                    defaultValue={
                        event.venue ?? ""
                    }
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="starts_at">
                        Starts At
                    </Label>

                    <Input
                        id="starts_at"
                        name="starts_at"
                        type="datetime-local"
                        defaultValue={
                            event.starts_at
                                ? new Date(
                                    event.starts_at
                                )
                                    .toISOString()
                                    .slice(0, 16)
                                : ""
                        }
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ends_at">
                        Ends At
                    </Label>

                    <Input
                        id="ends_at"
                        name="ends_at"
                        type="datetime-local"
                        defaultValue={
                            event.ends_at
                                ? new Date(
                                    event.ends_at
                                )
                                    .toISOString()
                                    .slice(0, 16)
                                : ""
                        }
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="max_attendees">
                    Maximum Attendees
                </Label>

                <Input
                    id="max_attendees"
                    name="max_attendees"
                    type="number"
                    min="1"
                    defaultValue={
                        event.max_attendees ?? ""
                    }
                    placeholder="Leave empty for unlimited attendees"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">
                    Event Status
                </Label>

                <select
                    id="status"
                    name="status"
                    defaultValue={
                        event.status ??
                        "published"
                    }
                    className="w-full rounded-md border bg-background px-3 py-2"
                >
                    <option value="draft">
                        Draft
                    </option>

                    <option value="published">
                        Published
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>

                    <option value="completed">
                        Completed
                    </option>
                </select>
            </div>

            <div className="flex items-center gap-2 opacity-60">
                 <input
                     type="checkbox"
                     id="is_paid"
                     name="is_paid"
                     disabled
                     defaultChecked={
                         event.is_paid
                     }
                     className="h-4 w-4 cursor-not-allowed"
                 />

                 <Label
                     htmlFor="is_paid"
                     className="cursor-not-allowed flex items-center gap-1.5"
                 >
                     This is a paid event <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Coming Soon</span>
                 </Label>
             </div>

             <div className="space-y-2 opacity-60">
                 <Label htmlFor="ticket_price" className="cursor-not-allowed">
                     Ticket Price
                 </Label>

                 <Input
                     id="ticket_price"
                     name="ticket_price"
                     type="number"
                     disabled
                     className="cursor-not-allowed"
                     step="0.01"
                     defaultValue={
                         event.ticket_price
                     }
                 />
             </div>

            <SubmitButton />
        </form>
    );
}