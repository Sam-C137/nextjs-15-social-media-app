"use client";

import { FollowerInfo, UserData } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import FollowerCount from "@/components/FollowerCount";

interface UserToolTipProps extends React.PropsWithChildren {
    user: UserData;
}

export default function UserToolTip({ children, user }: UserToolTipProps) {
    const { user: loggedInUser } = useSession();
    const followerState: FollowerInfo = {
        followers: user._count.followers,
        isFollowedByUser: user.followers.some(
            ({ followerId }) => loggedInUser.id === followerId,
        ),
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent>
                    <div className="flex max-w-80 flex-col gap-3 break-words md:min-w-52">
                        <div className="flex items-center justify-between gap-2 px-1 py-2.5">
                            <Link href={`/users/${user.username}`}>
                                <Avatar
                                    src={user.avatarUrl}
                                    fallback={user.username}
                                    size={70}
                                    className="size-[70px]"
                                />
                            </Link>
                            {loggedInUser.id !== user.id && (
                                <FollowButton
                                    userId={user.id}
                                    initialState={followerState}
                                />
                            )}
                        </div>
                        <div>
                            <Link href={`/users/${user.username}`}>
                                <h6 className="text-lg font-semibold hover:underline">
                                    {user.displayName}
                                </h6>
                                <p className="text-muted-foreground">
                                    @{user.username}
                                </p>
                            </Link>
                        </div>
                        {user.bio && (
                            <Linkify>
                                <div className="line-clamp-4 whitespace-pre-line">
                                    {user.bio}
                                </div>
                            </Linkify>
                        )}
                        <FollowerCount
                            userId={user.id}
                            initialState={followerState}
                        />
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
