import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark, Home } from "lucide-react";
import NotificationButton from "@/components/menu/NotificationButton";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import MessageButton from "@/components/menu/MessageButton";
import streamServerClient from "@/lib/stream";

interface MenubarProps {
    className?: string;
}

export default async function Menubar({ className }: MenubarProps) {
    const { user } = await validateRequest();
    if (!user) return;

    const [unreadNotificationCount, unreadMessagesCount] = await Promise.all([
        prisma.notification.count({
            where: {
                recipientId: user.id,
                read: false,
            },
        }),
        streamServerClient.getUnreadCount(user.id),
    ]);

    return (
        <div className={className}>
            <Button
                variant="ghost"
                title="Home"
                className="flex items-center justify-start gap-3"
                asChild
            >
                <Link href="/public">
                    <Home />
                    <span className="hidden lg:inline">Home</span>
                </Link>
            </Button>
            <NotificationButton
                initialState={{
                    unreadCount: unreadNotificationCount,
                }}
            />
            <MessageButton
                initialState={{
                    unreadCount: unreadMessagesCount.total_unread_count,
                }}
            />
            <Button
                variant="ghost"
                title="Bookmarks"
                className="flex items-center justify-start gap-3"
                asChild
            >
                <Link href="/bookmarks">
                    <Bookmark />
                    <span className="hidden lg:inline">Bookmarks</span>
                </Link>
            </Button>
        </div>
    );
}
