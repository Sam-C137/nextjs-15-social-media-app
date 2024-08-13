import { useToast } from "@/components/ui/use-toast";
import {
    InfiniteData,
    QueryFilters,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { deletePost } from "@/components/posts/post-item/actions";
import { Paginated } from "@/lib/helpers.types";
import { PostData } from "@/lib/types";

export function useDeletePost() {
    const { toast } = useToast();
    const client = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();

    return useMutation({
        mutationFn: deletePost,
        onSuccess: async (deletedPost) => {
            const queryFilter: QueryFilters = {
                queryKey: ["post-feed"],
            };

            await client.cancelQueries(queryFilter);

            client.setQueriesData<
                InfiniteData<Paginated<PostData>, string | null>
            >(queryFilter, (oldData) => {
                if (!oldData) return;

                return {
                    pageParams: oldData.pageParams,
                    pages: oldData.pages.map((page) => ({
                        nextCursor: page.nextCursor,
                        items: page.items.filter(
                            (p) => p.id !== deletedPost.id,
                        ),
                    })),
                };
            });

            toast({
                description: "Post deleted",
            });

            if (pathname === `/posts/${deletedPost.id}`) {
                router.push(`/users/${deletedPost.user.username}`);
            }
        },
        onError: (error) => {
            console.error(error);
            toast({
                variant: "destructive",
                description: "Failed to delete post. Please try again",
            });
        },
    });
}
