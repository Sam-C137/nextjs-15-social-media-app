"use server";

import { cache } from "react";
import prisma from "@/lib/prisma";
import { FollowerInfo, selectUserData, UserData } from "@/lib/types";
import { notFound } from "next/navigation";
import { validateRequest } from "@/auth";
import { Metadata } from "next";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "date-fns";
import { formatNumber } from "@/lib/utils";
import FollowerCount from "@/app/(main)/users/[username]/FollowerCount";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/FollowButton";

interface PageProps {
    params: { username: string };
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
    const user = await prisma.user.findFirst({
        where: {
            username: {
                equals: username,
                mode: "insensitive",
            },
        },
        select: selectUserData(loggedInUserId),
    });

    if (!user) notFound();

    return user;
});

export default async function Page({ params: { username } }: PageProps) {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) return;

    const user = await getUser(username, loggedInUser.id);

    return (
        <main className="flex w-full min-w-0 gap-5">
            <div className="w-full min-w-0 space-y-5">
                <UserProfile user={user} loggedInUserId={loggedInUser.id} />
            </div>
            <TrendsSidebar />
        </main>
    );
}

export async function generateMetadata({
    params: { username },
}: PageProps): Promise<Metadata> {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) return {};

    const user = await getUser(username, loggedInUser.id);

    return {
        title: `${user.displayName} (@${user.username})`,
    };
}

interface UserProfileProps {
    user: UserData;
    loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
    const followerInfo: FollowerInfo = {
        followers: user._count.followers,
        isFollowedByUser: user.followers.some(
            ({ followerId }) => followerId === loggedInUserId,
        ),
    };

    return (
        <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
            <Avatar
                src={user.avatarUrl}
                fallback={user.username}
                size={250}
                className="mx-auto size-full max-h-60 max-w-60 rounded-full"
            />
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
                <div className="me-auto space-y-3">
                    <div>
                        <h1 className="text-3xl font-bold">
                            {user.displayName}
                        </h1>
                        <b className="font-medium text-muted-foreground">
                            @{user.username}
                        </b>
                    </div>
                    <h3>
                        Member since {formatDate(user.createdAt, "MMM d, yyyy")}
                    </h3>
                    <span className="flex items-center gap-3">
                        <h3>
                            Posts:{" "}
                            <b className="font-semibold">
                                {formatNumber(user._count.posts)}
                            </b>
                        </h3>
                        <FollowerCount
                            userId={user.id}
                            initialState={followerInfo}
                        />
                    </span>
                </div>
                {user.id === loggedInUserId ? (
                    <Button>Edit Profile</Button>
                ) : (
                    <FollowButton
                        userId={user.id}
                        initialState={followerInfo}
                    />
                )}
            </div>
            {user.bio && (
                <>
                    <hr />
                    <div className="overflow-hidden whitespace-pre-line break-words">
                        {user.bio}
                    </div>
                </>
            )}
        </div>
    );
}
