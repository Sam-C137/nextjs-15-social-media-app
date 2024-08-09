"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import PostItem from "@/components/posts/PostItem";
import ky from "@/lib/ky";
import { Paginated } from "@/lib/helpers.types";
import { PostData } from "@/lib/types";
import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll-container";

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
        return <Loader2 className="mx-auto animate-spin" />;
    }

    if (error) {
        return (
            <p className="text-center text-destructive">
                An error occured while loading posts
            </p>
        );
    }

    return (
        <InfiniteScrollContainer
            onBottomReached={() => {
                console.log("hasNextPage", hasNextPage);
                console.log("isFetching", isFetching);
                hasNextPage && !isFetching && fetchNextPage();
            }}
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
