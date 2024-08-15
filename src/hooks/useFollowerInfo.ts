"use client";

import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";

export default function useFollowerInfo(
    userId: string,
    initialState: FollowerInfo,
) {
    return useQuery({
        queryKey: ["follower-info", userId],
        queryFn: () =>
            ky.get(`/api/users/${userId}/followers`).json<FollowerInfo>(),
        initialData: initialState,
        staleTime: Infinity,
    });
}
