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
                optionsText: "",
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
        const cleanedQuestions = questions.map(({ optionsText, ...q }) => q);
        formData.append("custom_questions", JSON.stringify(cleanedQuestions));
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

            {/* Custom Registration Questions Builder */}
            <div className="rounded-2xl border p-6 bg-card space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Custom Registration Questions</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Define additional questions for attendees during registration.</p>
                    </div>
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="inline-flex items-center gap-1 bg-black text-white hover:bg-black/90 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Question
                    </button>
                </div>

                {questions.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                        No custom questions. Attendees will register with Name & Email only.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="relative rounded-xl border p-4 bg-background/50 space-y-4 shadow-2xs">
                                <div className="absolute right-3 top-3">
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(q.id)}
                                        className="text-muted-foreground hover:text-red-500 p-1.5 rounded-lg hover:bg-muted/50 transition cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Label Input */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Question {idx + 1} Label</Label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., T-Shirt Size, Dietary Needs..."
                                            value={q.label}
                                            onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                                            required
                                            className="h-9 rounded-xl"
                                        />
                                    </div>

                                    {/* Type Selector */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Input Type</Label>
                                        <div className="relative">
                                            <select
                                                value={q.type}
                                                onChange={(e) => updateQuestion(q.id, { type: e.target.value })}
                                                className="w-full bg-transparent border rounded-xl text-sm font-semibold pr-8 pl-3 py-1.5 cursor-pointer text-foreground appearance-none h-9 border-input focus:ring-0 focus:outline-none"
                                                style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 10px center', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
                                            >
                                                <option value="text">Short Text</option>
                                                <option value="select">Dropdown Menu</option>
                                                <option value="checkbox">Checkbox Switch</option>
                                                <option value="number">Number Field</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Conditionally Render Options for Select dropdowns */}
                                {q.type === "select" && (
                                    <div className="space-y-1.5 pl-3 border-l-2 border-primary/20">
                                        <Label className="text-xs font-bold text-muted-foreground">Dropdown Options (Comma Separated)</Label>
                                        <Input
                                            type="text"
                                            placeholder="Small, Medium, Large"
                                            value={q.optionsText ?? ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                updateQuestion(q.id, {
                                                    optionsText: val,
                                                    options: val
                                                        .split(",")
                                                        .map((s) => s.trim())
                                                        .filter(Boolean),
                                                });
                                            }}
                                            required
                                            className="h-8 text-xs rounded-xl"
                                        />
                                    </div>
                                )}

                                {/* Required Checkbox */}
                                <div className="flex items-center space-x-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id={`req_${q.id}`}
                                        checked={q.required}
                                        onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                    <Label htmlFor={`req_${q.id}`} className="text-xs font-semibold cursor-pointer">
                                        This question is required
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <FormButtons />
        </form>
    );
}
