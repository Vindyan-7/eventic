"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { updateOrganization } from "@/services/organizations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Loader2 } from "lucide-react";
import Image from "next/image";

interface OrganizationSettingsFormProps {
    organization: {
        id: string;
        name: string;
        description: string | null;
        website: string | null;
        logo_url: string | null;
    };
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full"
        >
            {pending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
        </Button>
    );
}

export function OrganizationSettingsForm({
    organization,
}: OrganizationSettingsFormProps) {
    const [preview, setPreview] = useState<string | null>(
        organization.logo_url
    );

    async function handleSubmit(formData: FormData) {
        try {
            await updateOrganization(formData);
        } catch (err: any) {
            alert(err.message);
        }
    }


    return (
        <form
            action={handleSubmit}

            className="space-y-6"
        >
            <div className="space-y-3">
                <Label>Organization Logo</Label>

                {preview && (
                    <div className="relative h-32 w-32 overflow-hidden rounded-2xl border">
                        <Image
                            src={preview}
                            alt="Organization Logo"
                            fill
                            sizes="128px"
                            className="object-cover"
                        />
                    </div>
                )}

                <Input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={(e) => {
                        const file =
                            e.target.files?.[0];

                        if (!file) return;

                        setPreview(
                            URL.createObjectURL(file)
                        );
                    }}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">
                    Organization Name
                </Label>

                <Input
                    id="name"
                    name="name"
                    defaultValue={organization.name}
                    required
                />
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
                        organization.description ?? ""
                    }
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="website">
                    Website
                </Label>

                <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://example.com"
                    defaultValue={
                        organization.website ?? ""
                    }
                />
            </div>

            <SubmitButton />
        </form>
    );
}