"use client";

import { BookmarkInfo } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import {
    QueryKey,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import ky from "@/lib/ky";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
    postId: string;
    initialState: BookmarkInfo;
}

export default function BookmarkButton({
    postId,
    initialState,
}: BookmarkButtonProps) {
    const { toast } = useToast();
    const client = useQueryClient();
    const queryKey: QueryKey = ["bookmark-info", postId];
    const { data } = useQuery({
        queryKey: queryKey,
        queryFn: () =>
            ky.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>(),
        initialData: initialState,
        staleTime: Infinity,
    });

    const { mutate } = useMutation({
        mutationFn: () =>
            data.isBookmarkedByUser
                ? ky.delete(`/api/posts/${postId}/bookmark`)
                : ky.post(`/api/posts/${postId}/bookmark`),
        onMutate: async () => {
            toast({
                description: `Post ${
                    data.isBookmarkedByUser ? "removed from" : "added to"
                } your bookmarks`,
            });
            await client.cancelQueries({ queryKey });
            const prevState = client.getQueryData<BookmarkInfo>(queryKey);

            client.setQueryData<BookmarkInfo>(queryKey, () => {
                return {
                    isBookmarkedByUser: !prevState?.isBookmarkedByUser,
                };
            });

            return { prevState };
        },
        onError(error, variables, context) {
            client.setQueryData(queryKey, context?.prevState);
            console.error(error);
            toast({
                variant: "destructive",
                description: "Something went wrong. Please try again",
            });
        },
    });

    return (
        <button onClick={() => mutate()} className="flex items-center gap-2">
            <Bookmark
                className={cn(
                    "size-5",
                    data.isBookmarkedByUser && "fill-primary text-primary",
                )}
            />
        </button>
    );
}
