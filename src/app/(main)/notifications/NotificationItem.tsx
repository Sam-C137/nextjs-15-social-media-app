import { NotificationData } from "@/lib/types";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import React from "react";

interface NotificationItemProps {
    notification: NotificationData;
}

export default function NotificationItem({
    notification,
}: NotificationItemProps) {
    const notificationMap: Record<
        NotificationType,
        {
            message: string;
            icon: React.ReactNode;
            href: string;
        }
    > = {
        FOLLOW: {
            message: `${notification.issuer.displayName} followed you`,
            icon: <User2 className="size-7 text-primary" />,
            href: `/users/${notification.issuer.username}`,
        },
        COMMENT: {
            message: `${notification.issuer.displayName} commented on your post`,
            icon: (
                <MessageCircle className="size-7 fill-primary text-primary" />
            ),
            href: `/posts/${notification.postId}`,
        },
        LIKE: {
            message: `${notification.issuer.displayName} liked your post`,
            icon: <Heart className="size-7 fill-red-500 text-red-500" />,
            href: `/posts/${notification.postId}`,
        },
    };

    const { message, icon, href } = notificationMap[notification.type];

    return (
        <Link href={href} className="block">
            <article
                className={cn(
                    "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
                    !notification.read && "bg-primary/10",
                )}
            >
                <div className="my-1">{icon}</div>
                <div className="space-y-3">
                    <Avatar
                        src={notification.issuer.avatarUrl}
                        fallback={notification.issuer.displayName}
                    />
                    <div>
                        <span className="font-bold">
                            {notification.issuer.displayName}
                        </span>{" "}
                        <span>{message}</span>
                    </div>
                    {notification.post && (
                        <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
                            {notification.post.content}
                        </div>
                    )}
                </div>
            </article>
        </Link>
    );
}
