"use client";

import { FollowerInfo } from "@/lib/types";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import { useToast } from "@/components/ui/use-toast";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ky from "@/lib/ky";

interface FollowButtonProps {
    userId: string;
    initialState: FollowerInfo;
}

export default function FollowButton({
    userId,
    initialState,
}: FollowButtonProps) {
    const queryKey: QueryKey = ["follower-info", userId];
    const { data } = useFollowerInfo(userId, initialState);
    const { toast } = useToast();
    const client = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: () =>
            data.isFollowedByUser
                ? ky.delete(`/api/users/${userId}/followers`)
                : ky.post(`/api/users/${userId}/followers`),
        onMutate: async () => {
            await client.cancelQueries({ queryKey });
            const prevState = client.getQueryData<FollowerInfo>(queryKey);

            client.setQueryData<FollowerInfo>(queryKey, () => {
                return {
                    followers:
                        (prevState?.followers || 0) +
                        (prevState?.isFollowedByUser ? -1 : +1),
                    isFollowedByUser: !prevState?.isFollowedByUser,
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
        <Button
            variant={data.isFollowedByUser ? "secondary" : "default"}
            onClick={() => mutate()}
        >
            {data.isFollowedByUser ? "Unfollow" : "Follow"}
        </Button>
    );
}
