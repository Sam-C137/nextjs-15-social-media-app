import { useToast } from "@/components/ui/use-toast";
import {
    InfiniteData,
    QueryFilters,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { createPost } from "@/components/posts/editor/actions";
import { Paginated } from "@/lib/helpers.types";
import { PostData } from "@/lib/types";

export function useCreatePost() {
    const { toast } = useToast();
    const client = useQueryClient();

    return useMutation({
        mutationFn: createPost,
        onSuccess: async (newPost) => {
            const queryFilter: QueryFilters = {
                queryKey: ["post-feed", "for-you"],
            };

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
                    return !query.state.data;
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
