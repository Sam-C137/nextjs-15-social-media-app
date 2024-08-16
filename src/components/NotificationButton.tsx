"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell } from "lucide-react";
import { NotificationCount } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";

interface NotificationButtonProps {
    initialState: NotificationCount;
}

export default function NotificationButton({
    initialState,
}: NotificationButtonProps) {
    const { data } = useQuery({
        queryKey: ["unread-notification-count"],
        queryFn: () =>
            ky.get("/api/notifications/unread-count").json<NotificationCount>(),
        initialData: initialState,
        refetchInterval: 60 * 1000,
    });

    return (
        <Button
            variant="ghost"
            title="Notifications"
            className="flex items-center justify-start gap-3"
            asChild
        >
            <Link href="/notifications">
                <div className="relative">
                    <Bell />
                    {data.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
                            {data.unreadCount}
                        </span>
                    )}
                </div>
                <span className="hidden lg:inline">Notifications</span>
            </Link>
        </Button>
    );
}
