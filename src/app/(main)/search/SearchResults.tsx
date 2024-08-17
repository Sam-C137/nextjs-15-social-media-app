"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";
import { Paginated } from "@/lib/utils";
import { PostData } from "@/lib/types";
import { PostLoadingSkeleton } from "@/components/posts/PostLoadingSkeleton";
import { InfiniteScrollContainer } from "@/components/ui/infinite-scroll-container";
import PostItem from "@/components/posts/post-item/PostItem";
import { Loader2 } from "lucide-react";

interface SearchResultsProps {
    query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
    const {
        data,
        isPending,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["post-feed", "search", query],
        queryFn: ({ pageParam }) =>
            ky
                .get("/api/search", {
                    searchParams: {
                        q: query,
                        ...(pageParam ? { cursor: pageParam } : {}),
                    },
                })
                .json<Paginated<PostData>>(),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        gcTime: 0,
    });

    const posts = data?.pages.flatMap((page) => page.items) || [];

    if (isPending) {
        return <PostLoadingSkeleton />;
    }

    if (error) {
        return (
            <p className="text-center text-destructive">An error occurred.</p>
        );
    }

    if (data && posts.length < 1 && !hasNextPage) {
        return (
            <p className="text-center text-muted-foreground">
                Nothing found for this query
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
