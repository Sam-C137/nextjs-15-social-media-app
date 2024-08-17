"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import PostItem from "@/components/posts/post-item/PostItem";
import ky from "@/lib/ky";
import { Paginated } from "@/lib/utils";
import { PostData } from "@/lib/types";
import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll-container";
import { PostLoadingSkeleton } from "@/components/posts/PostLoadingSkeleton";

export default function Bookmarks() {
    const {
        data,
        isPending,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["post-feed", "bookmarks"],
        queryFn: ({ pageParam }) =>
            ky
                .get(
                    "/api/posts/bookmarked",
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
        return <PostLoadingSkeleton />;
    }

    if (error) {
        return (
            <p className="text-center text-destructive">
                An error occurred while loading bookmarks
            </p>
        );
    }

    if (data && posts.length < 1 && !hasNextPage) {
        return (
            <p className="text-center text-muted-foreground">
                You don&apos;t have any bookmarks yet
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
