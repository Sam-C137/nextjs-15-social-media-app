"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";
import { Paginated } from "@/lib/utils";
import { PostData } from "@/lib/types";
import { LoadingSkeleton } from "@/components/posts/LoadingSkeleton";
import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll-container";
import PostItem from "@/components/posts/post-item/PostItem";
import { Loader2 } from "lucide-react";

export default function FollowingFeed() {
    const {
        data,
        isPending,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["post-feed", "following"],
        queryFn: ({ pageParam }) =>
            ky
                .get(
                    "/api/posts/following",
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
                No posts found. Start following people to see their posts here
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
