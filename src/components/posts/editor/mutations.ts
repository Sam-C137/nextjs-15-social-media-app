import { useToast } from "@/components/ui/use-toast";
import {
    InfiniteData,
    QueryFilters,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { createPost } from "@/components/posts/editor/actions";
import { Paginated } from "@/lib/utils";
import { PostData } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";

export function useCreatePost() {
    const { toast } = useToast();
    const client = useQueryClient();
    const { user } = useSession();

    return useMutation({
        mutationFn: createPost,
        onSuccess: async (newPost) => {
            const queryFilter = {
                queryKey: ["post-feed"],
                predicate(query) {
                    return (
                        query.queryKey.includes("for-you") ||
                        (query.queryKey.includes("user-posts") &&
                            query.queryKey.includes(user.id))
                    );
                },
            } satisfies QueryFilters;

            await client.cancelQueries(queryFilter);

            client.setQueriesData<
                InfiniteData<Paginated<PostData>, string | null>
            >(queryFilter, (oldData) => {
                const firstPage = oldData?.pages[0];

                if (firstPage) {
                    return {
                        pageParams: oldData.pageParams,
                        pages: [
                            {
                                items: [newPost, ...firstPage.items],
                                nextCursor: firstPage.nextCursor,
                            },
                            ...oldData.pages.slice(1),
                        ],
                    };
                }
            });

            // invalidate query in case the first query was cancelled
            await client.invalidateQueries({
                queryKey: queryFilter.queryKey,
                predicate(query) {
                    return queryFilter.predicate(query) && !query.state.data;
                },
            });

            toast({
                description: "Post created",
            });
        },
        onError: (error) => {
            console.error(error);
            toast({
                variant: "destructive",
                description: "Failed to create a new post. Please try again",
            });
        },
    });
}
