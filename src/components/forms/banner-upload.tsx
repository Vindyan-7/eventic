"use client";

import Image from "next/image";
import { useRef } from "react";
import { Upload } from "lucide-react";

interface Props {
    preview: string | null;

    setPreview: (
        value: string | null
    ) => void;

    setFile: (
        file: File | null
    ) => void;
}

export function BannerUpload({
    preview,
    setPreview,
    setFile,
}: Props) {
    const inputRef =
        useRef<HTMLInputElement>(null);

    function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const file =
            e.target.files?.[0];

        if (!file) return;

        setFile(file);

        const objectUrl =
            URL.createObjectURL(file);

        setPreview(objectUrl);
    }

    return (
        <div className="space-y-4">
            <div
                onClick={() =>
                    inputRef.current?.click()
                }
                className="relative flex h-64 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed"
            >
                {preview ? (
                    <Image
                        src={preview}
                        alt="Banner Preview"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Upload className="h-8 w-8" />

                        <p>
                            Upload Event Banner
                        </p>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                name="banner"
                accept="image/*"
                hidden
                onChange={handleFileChange}
            />
        </div>
    );
}