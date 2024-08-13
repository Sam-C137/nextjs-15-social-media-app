"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import PostItem from "@/components/posts/post-item/PostItem";
import ky from "@/lib/ky";
import { Paginated } from "@/lib/helpers.types";
import { PostData } from "@/lib/types";
import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll-container";
import { LoadingSkeleton } from "@/components/posts/LoadingSkeleton";

export default function ForYouFeed() {
    const {
        data,
        isPending,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["post-feed", "for-you"],
        queryFn: ({ pageParam }) =>
            ky
                .get(
                    "/api/posts/for-you",
                    pageParam
                        ? {
                              searchParams: {
                                  cursor: pageParam,
                              },
                          }
                        : {},
                )
                .json<Paginated<PostData>>(),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    const posts = data?.pages.flatMap((page) => page.items) || [];

    if (isPending) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <p className="text-center text-destructive">
                An error occurred while loading posts
            </p>
        );
    }

    if (data && posts.length < 1 && !hasNextPage) {
        return (
            <p className="text-center text-muted-foreground">
                No one has posted anything yet
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
            {posts.map((post) => (
                <PostItem post={post} key={post.id} />
            ))}
            {isFetchingNextPage && (
                <Loader2 className="mx-auto my-3 animate-spin" />
            )}
        </InfiniteScrollContainer>
    );
}
