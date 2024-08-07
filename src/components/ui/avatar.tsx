"use client";

import { Optional } from "@/lib/helpers.types";
import React from "react";
import Image from "next/image";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
    src: Optional<string>;
    fallback: string;
    className?: string;
}

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
    ({ src, fallback, className, ...props }, ref) => {
        return (
            <span
                className={cn(
                    "grid size-[2.5rem] place-items-center rounded-[50%] bg-card",
                    className,
                )}
                {...props}
            >
                <Image
                    ref={ref}
                    src={src || avatarPlaceholder}
                    className="h-full w-full rounded-[50%] object-cover"
                    alt={fallback}
                />
            </span>
        );
    },
);
Avatar.displayName = "Avatar";

export { Avatar };
