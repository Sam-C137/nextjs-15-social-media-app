"use client";

import { MessageCount, NotificationCount } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail } from "lucide-react";

interface MessageButtonButtonProps {
    initialState: MessageCount;
}

export default function MessageButton({
    initialState,
}: MessageButtonButtonProps) {
    const { data } = useQuery({
        queryKey: ["unread-message-count"],
        queryFn: () =>
            ky.get("/api/messages/unread-count").json<NotificationCount>(),
        initialData: initialState,
        refetchInterval: 60 * 1000,
    });

    return (
        <Button
            variant="ghost"
            title="Messages"
            className="flex items-center justify-start gap-3"
            asChild
        >
            <Link href="/messages">
                <div className="relative">
                    <Mail />
                    {data.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
                            {data.unreadCount}
                        </span>
                    )}
                </div>
                <span className="hidden lg:inline">Messages</span>
            </Link>
        </Button>
    );
}
