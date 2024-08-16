import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark, Home, Mail } from "lucide-react";
import NotificationButton from "@/components/NotificationButton";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

interface MenubarProps {
    className?: string;
}

export default async function Menubar({ className }: MenubarProps) {
    const { user } = await validateRequest();
    if (!user) return;

    const unreadCount = await prisma.notification.count({
        where: {
            recipientId: user.id,
            read: false,
        },
    });

    return (
        <div className={className}>
            <Button
                variant="ghost"
                title="Home"
                className="flex items-center justify-start gap-3"
                asChild
            >
                <Link href="/">
                    <Home />
                    <span className="hidden lg:inline">Home</span>
                </Link>
            </Button>
            <NotificationButton
                initialState={{
                    unreadCount,
                }}
            />
            <Button
                variant="ghost"
                title="Messages"
                className="flex items-center justify-start gap-3"
                asChild
            >
                <Link href="/messages">
                    <Mail />
                    <span className="hidden lg:inline">Messages</span>
                </Link>
            </Button>
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
