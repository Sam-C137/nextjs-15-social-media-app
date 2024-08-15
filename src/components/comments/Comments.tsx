import { CommentData, PostData } from "@/lib/types";
import CommentInput from "@/components/comments/CommentInput";
import { useInfiniteQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";
import { ReversePaginated } from "@/lib/utils";
import CommentItem from "@/components/comments/CommentItem";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CommentsProps {
    post: PostData;
}

export default function Comments({ post }: CommentsProps) {
    const { data, fetchNextPage, hasNextPage, isFetching, isPending, error } =
        useInfiniteQuery({
            queryKey: ["comments", post.id],
            queryFn: ({ pageParam }) =>
                ky
                    .get(
                        `/api/posts/${post.id}/comments`,
                        pageParam
                            ? {
                                  searchParams: {
                                      cursor: pageParam,
                                  },
                              }
                            : {},
                    )
                    .json<ReversePaginated<CommentData>>(),
            initialPageParam: null as string | null,
            getNextPageParam: (firstPage) => firstPage.previousCursor,
            select: (data) => ({
                pages: [...data.pages].reverse(),
                pageParams: [...data.pageParams].reverse(),
            }),
        });

    const comments = data?.pages.flatMap((page) => page.items) || [];

    return (
        <div className="space-y-3">
            <CommentInput post={post} />
            {hasNextPage && (
                <Button
                    variant="link"
                    className="mx-auto block"
                    disabled={isFetching}
                    onClick={() => fetchNextPage()}
                >
                    Load previous comments
                </Button>
            )}
            {isPending && <Loader2 className="mx-auto animate-spin" />}
            {data && comments.length < 1 && (
                <p className="text-center text-muted-foreground">
                    No comments yet.
                </p>
            )}
            {error && (
                <p className="text-center text-destructive">
                    An error occurred while loading comments.
                </p>
            )}
            <div className="divide-y">
                {comments.map((comment) => (
                    <CommentItem comment={comment} key={comment.id} />
                ))}
            </div>
        </div>
    );
}
