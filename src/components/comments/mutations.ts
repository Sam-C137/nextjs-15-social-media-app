import { useToast } from "@/components/ui/use-toast";
import {
    InfiniteData,
    QueryKey,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { createComment, deleteComment } from "@/components/comments/actions";
import { ReversePaginated } from "@/lib/utils";
import { CommentData } from "@/lib/types";

export function useCreateComment(postId: string) {
    const { toast } = useToast();
    const client = useQueryClient();

    return useMutation({
        mutationFn: createComment,
        onSuccess: async (newComment) => {
            const queryKey: QueryKey = ["comments", postId];
            await client.cancelQueries({ queryKey });

            client.setQueryData<
                InfiniteData<ReversePaginated<CommentData>, string | null>
            >(queryKey, (oldData) => {
                const firstPage = oldData?.pages[0];
                if (firstPage) {
                    return {
                        pageParams: oldData?.pageParams,
                        pages: [
                            {
                                previousCursor: firstPage.previousCursor,
                                items: [...firstPage.items, newComment],
                            },
                            ...oldData?.pages.slice(1),
                        ],
                    };
                }
            });

            await client.invalidateQueries({
                queryKey,
                predicate(query) {
                    return !query.state.data;
                },
            });

            toast({
                description: "Comment added!",
            });
        },
        onError: (error) => {
            console.error(error);
            toast({
                variant: "destructive",
                description: "Failed to add comment. Please try again",
            });
        },
    });
}

export function useDeleteComment() {
    const { toast } = useToast();
    const client = useQueryClient();

    return useMutation({
        mutationFn: deleteComment,
        onSuccess: async (deletedComment) => {
            const queryKey: QueryKey = ["comments", deletedComment.postId];
            await client.cancelQueries({ queryKey });

            client.setQueryData<
                InfiniteData<ReversePaginated<CommentData>, string | null>
            >(queryKey, (oldData) => {
                if (!oldData) return;

                return {
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page) => ({
                        previousCursor: page.previousCursor,
                        items: page.items.filter(
                            (c) => c.id !== deletedComment.id,
                        ),
                    })),
                };
            });

            toast({
                description: "Comment deleted",
            });
        },
        onError: (error) => {
            console.error(error);
            toast({
                variant: "destructive",
                description: "Failed to delete comment. Please try again",
            });
        },
    });
}
