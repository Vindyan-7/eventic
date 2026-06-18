"use client";

import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormDescription,
    FormField as ShadcnFormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
    name: string;
    label?: string;
    placeholder?: string;
    description?: string;
    className?: string;
}

export function FormInput({ name, label, placeholder, description, className }: BaseFieldProps & { type?: string }) {
    const { control } = useFormContext();

    return (
        <ShadcnFormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Input placeholder={placeholder} {...field} />
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function FormTextarea({ name, label, placeholder, description, className }: BaseFieldProps) {
    const { control } = useFormContext();

    return (
        <ShadcnFormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Textarea placeholder={placeholder} {...field} />
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
