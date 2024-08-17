"use client";

import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import ky from "@/lib/ky";
import { Paginated } from "@/lib/utils";
import { NotificationData } from "@/lib/types";
import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll-container";
import { PostLoadingSkeleton } from "@/components/posts/PostLoadingSkeleton";
import NotificationItem from "@/app/(main)/notifications/NotificationItem";
import { useEffect } from "react";

export default function Notifications() {
    const {
        data,
        isPending,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["notifications"],
        queryFn: ({ pageParam }) =>
            ky
                .get(
                    "/api/notifications",
                    pageParam
                        ? {
                              searchParams: {
                                  cursor: pageParam,
                              },
                          }
                        : {},
                )
                .json<Paginated<NotificationData>>(),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
    const client = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: () => ky.patch("/api/notifications"),
        onSuccess: () => {
            client.setQueryData(["unread-notification-count"], {
                unreadCount: 0,
            });
        },
        onError(error) {
            console.error("Failed to mark notifications as read", error);
        },
    });

    useEffect(() => {
        mutate();
    }, [mutate]);

    const notifications = data?.pages.flatMap((page) => page.items) || [];

    if (isPending) {
        return <PostLoadingSkeleton />;
    }

    if (error) {
        return (
            <p className="text-center text-destructive">
                An error occurred while loading notifications
            </p>
        );
    }

    if (data && notifications.length < 1 && !hasNextPage) {
        return (
            <p className="text-center text-muted-foreground">
                You don&apos;t have any notifications yet
            </p>
        );
    }

    return (
        <InfiniteScrollContainer
            onBottomReached={() =>
                hasNextPage && !isFetching && fetchNextPage()
            }
            className="space-y-5"
        >
            {notifications.map((notification) => (
                <NotificationItem
                    notification={notification}
                    key={notification.id}
                />
            ))}
            {isFetchingNextPage && (
                <Loader2 className="mx-auto my-3 animate-spin" />
            )}
        </InfiniteScrollContainer>
    );
}
