"use client";

import { LikeInfo } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import {
    QueryKey,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import ky from "@/lib/ky";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
    postId: string;
    initialState: LikeInfo;
}

export default function LikeButton({ postId, initialState }: LikeButtonProps) {
    const { toast } = useToast();
    const client = useQueryClient();
    const queryKey: QueryKey = ["like-info", postId];
    const { data } = useQuery({
        queryKey: queryKey,
        queryFn: () => ky.get(`/api/posts/${postId}/likes`).json<LikeInfo>(),
        initialData: initialState,
        staleTime: Infinity,
    });

    const { mutate } = useMutation({
        mutationFn: () =>
            data.isLikedByUser
                ? ky.delete(`/api/posts/${postId}/likes`)
                : ky.post(`/api/posts/${postId}/likes`),
        onMutate: async () => {
            await client.cancelQueries({ queryKey });
            const prevState = client.getQueryData<LikeInfo>(queryKey);

            client.setQueryData<LikeInfo>(queryKey, () => {
                return {
                    likes:
                        (prevState?.likes || 0) +
                        (prevState?.isLikedByUser ? -1 : +1),
                    isLikedByUser: !prevState?.isLikedByUser,
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
            <Heart
                className={cn(
                    "size-5",
                    data.isLikedByUser && "fill-red-500 text-red-500",
                )}
            />
            <span className="font-medium tabular-nums">
                {data.likes}{" "}
                <span className="hidden sm:inline">
                    {data.likes === 1 ? "like" : "likes"}
                </span>
            </span>
        </button>
    );
}
