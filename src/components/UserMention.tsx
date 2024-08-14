"use client";

import { useQuery } from "@tanstack/react-query";
import ky from "@/lib/ky";
import { UserData } from "@/lib/types";
import { HTTPError } from "ky";
import Link from "next/link";
import UserToolTip from "@/components/UserTooltip";

interface UserMentionProps extends React.PropsWithChildren {
    username: string;
}

export default function UserMention({ children, username }: UserMentionProps) {
    const { data } = useQuery({
        queryKey: ["user-data", username],
        queryFn: ky.get(`/api/users/username/${username}`).json<UserData>,
        retry(failureCount, error) {
            if (error instanceof HTTPError && error.response.status === 404) {
                return false;
            }

            return failureCount < 3;
        },
        staleTime: Infinity,
    });

    if (!data) {
        return (
            <Link
                href={`/users/${username}`}
                className="text-primary hover:underline"
            >
                {children}
            </Link>
        );
    }

    return (
        <UserToolTip user={data}>
            <Link
                href={`/users/${username}`}
                className="text-primary hover:underline"
            >
                {children}
            </Link>
        </UserToolTip>
    );
}
