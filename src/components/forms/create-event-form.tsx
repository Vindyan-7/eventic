"use client";

import { useState } from "react";
import { createEvent } from "@/services/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { BannerUpload } from "./banner-upload";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Event
        </Button>
    );
}

export function CreateEventForm() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    async function handleCreateEvent(formData: FormData) {
        await createEvent(formData);
    }

    return (
        <form
            action={handleCreateEvent}
            className="space-y-6"
        >
            <BannerUpload
                preview={preview}
                setPreview={setPreview}
                setFile={setFile}
            />

            <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Summer Tech Gala 2026"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Tell attendees what this event is about..."
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="venue">Venue / Location</Label>
                <Input
                    id="venue"
                    name="venue"
                    placeholder="e.g. San Francisco, CA or Virtual"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="starts_at">Starts At</Label>
                    <Input
                        id="starts_at"
                        name="starts_at"
                        type="datetime-local"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ends_at">Ends At</Label>
                    <Input
                        id="ends_at"
                        name="ends_at"
                        type="datetime-local"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="is_paid"
                    name="is_paid"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="is_paid" className="font-normal cursor-pointer">
                    This is a paid event
                </Label>
            </div>

            <div className="space-y-2">
                <Label htmlFor="ticket_price">Ticket Price (USD)</Label>
                <Input
                    id="ticket_price"
                    name="ticket_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue="0"
                />
            </div>

            <SubmitButton />
        </form>
    );
}
