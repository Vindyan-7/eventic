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

import { Plus, Trash2, HelpCircle } from "lucide-react";

function FormButtons() {
    const { pending } = useFormStatus();

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <Button
                type="submit"
                name="status"
                value="draft"
                variant="outline"
                className="flex-1"
                disabled={pending}
            >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Draft
            </Button>

            <Button
                type="submit"
                name="status"
                value="published"
                className="flex-1"
                disabled={pending}
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
    const [questions, setQuestions] = useState<any[]>([]);

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                label: "",
                type: "text",
                required: false,
                options: [],
            },
        ]);
    };

    const removeQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const updateQuestion = (id: string, fields: Partial<any>) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, ...fields } : q))
        );
    };

    async function handleCreateEvent(formData: FormData) {
        formData.append("custom_questions", JSON.stringify(questions));
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


            <div className="flex items-center space-x-2 opacity-60">
                <input
                    type="checkbox"
                    id="is_paid"
                    name="is_paid"
                    disabled
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-not-allowed"
                />
                <Label htmlFor="is_paid" className="font-normal cursor-not-allowed flex items-center gap-1.5">
                    This is a paid event <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Coming Soon</span>
                </Label>
            </div>

            <div className="space-y-2 opacity-60">
                <Label htmlFor="ticket_price" className="cursor-not-allowed">Ticket Price (USD)</Label>
                <Input
                    id="ticket_price"
                    name="ticket_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    defaultValue="0"
                    disabled
                    className="cursor-not-allowed"
                />
            </div>

            <div className="pt-6 border-t space-y-6">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        Custom Registration Questions
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Ask attendees questions during registration (e.g. T-Shirt Size, Food Preference).
                    </p>
                </div>

                <div className="space-y-4">
                    {questions.map((q, index) => (
                        <div
                            key={q.id}
                            className="p-4 border rounded-xl space-y-4 bg-muted/20 relative group"
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeQuestion(q.id)}
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Question Label</Label>
                                    <Input
                                        value={q.label}
                                        onChange={(e) =>
                                            updateQuestion(q.id, {
                                                label: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. T-Shirt Size"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Answer Type</Label>
                                    <select
                                        className="w-full rounded-xl border p-2 bg-background"
                                        value={q.type}
                                        onChange={(e) =>
                                            updateQuestion(q.id, {
                                                type: e.target.value,
                                                options: e.target.value === "dropdown" || e.target.value === "checkbox" ? [] : q.options,
                                            })
                                        }
                                    >
                                        <option value="text">Short Text</option>
                                        <option value="textarea">Long Text</option>
                                        <option value="number">Number</option>
                                        <option value="dropdown">Dropdown Options</option>
                                        <option value="checkbox">Multiple Choice (Checkboxes)</option>
                                    </select>
                                </div>
                            </div>

                            {(q.type === "dropdown" || q.type === "checkbox") && (
                                <div className="space-y-2">
                                    <Label>Options (comma separated)</Label>
                                    <Input
                                        value={q.options?.join(", ") || ""}
                                        onChange={(e) =>
                                            updateQuestion(q.id, {
                                                options: e.target.value
                                                    .split(",")
                                                    .map((s) => s.trim())
                                                    .filter(Boolean),
                                            })
                                        }
                                        placeholder="Small, Medium, Large, XL"
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={`required-${q.id}`}
                                    checked={q.required}
                                    onCheckedChange={(checked) =>
                                        updateQuestion(q.id, {
                                            required: !!checked,
                                        })
                                    }
                                />
                                <Label htmlFor={`required-${q.id}`}>
                                    Required question
                                </Label>
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={addQuestion}
                    className="w-full"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            </div>

            <FormButtons />
        </form>
    );
}
