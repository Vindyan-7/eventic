"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { hoverScale } from "@/lib/motion";

interface EventCardProps {
    title: string;
    date: string;
    location: string;
    image: string;
    price?: string | number;
    category: string;
    attendees?: number;
    className?: string;
}

export function EventCard({
    title,
    date,
    location,
    image,
    price,
    category,
    attendees,
    className,
}: EventCardProps) {
    return (
        <motion.div {...hoverScale}>
            <Card className="overflow-hidden border-none shadow-lg group cursor-pointer bg-background/50 backdrop-blur-sm">
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="glass capitalize">
                            {category}
                        </Badge>
                    </div>
                    {price && (
                        <div className="absolute bottom-3 right-3">
                            <Badge variant="default" className="shadow-lg">
                                {typeof price === "number" ? `$${price}` : price}
                            </Badge>
                        </div>
                    )}
                </div>
                <CardContent className="p-5">
                    <h3 className="text-lg font-bold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{location}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="px-5 py-4 border-t bg-muted/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{attendees || 0} attending</span>
                    </div>
                    <button className="text-xs font-semibold text-primary hover:underline">
                        View Details
                    </button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
