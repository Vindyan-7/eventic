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

function FormButtons() {
    const { pending } = useFormStatus();

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <input
                type="hidden"
                name="status"
                value="published"
                id="event-status"
            />

            <Button
                type="submit"
                variant="outline"
                className="flex-1"
                disabled={pending}
                onClick={() => {
                    const input =
                        document.getElementById(
                            "event-status"
                        ) as HTMLInputElement;

                    input.value = "draft";
                }}
            >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Draft
            </Button>

            <Button
                type="submit"
                className="flex-1"
                disabled={pending}
                onClick={() => {
                    const input =
                        document.getElementById(
                            "event-status"
                        ) as HTMLInputElement;

                    input.value = "published";
                }}
            >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Event
            </Button>
        </div>
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
                <Label htmlFor="category">
                    Category
                </Label>

                <select
                    id="category"
                    name="category"
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

            <div className="space-y-2">
                <Label htmlFor="max_attendees">
                    Maximum Attendees
                </Label>

                <Input
                    id="max_attendees"
                    name="max_attendees"
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited attendees"
                />
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

            <FormButtons />
        </form>
    );
}
