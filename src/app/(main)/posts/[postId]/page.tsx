import { cache, Suspense } from "react";
import prisma from "@/lib/prisma";
import { postInclude, UserData } from "@/lib/types";
import { notFound } from "next/navigation";
import { validateRequest } from "@/auth";
import PostItem from "@/components/posts/post-item/PostItem";
import UserToolTip from "@/components/shared/UserTooltip";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import Linkify from "@/components/shared/Linkify";
import FollowButton from "@/components/shared/FollowButton";

interface PageProps {
    params: {
        postId: string;
    };
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
    const post = await prisma.post.findUnique({
        where: {
            id: postId,
        },
        include: postInclude(loggedInUserId),
    });

    if (!post) notFound();

    return post;
});

export async function generateMetadata({ params: { postId } }: PageProps) {
    const { user } = await validateRequest();

    if (!user) return {};

    const post = await getPost(postId, user.id);

    return {
        title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
    };
}

export default async function Page({ params: { postId } }: PageProps) {
    const { user } = await validateRequest();
    if (!user) return;

    const post = await getPost(postId, user.id);

    return (
        <main className="flex w-full min-w-0 gap-5">
            <div className="w-full min-w-0 space-y-5">
                <PostItem post={post} />
            </div>
            <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
                <Suspense
                    fallback={<Loader2 className="mx-auto animate-spin" />}
                >
                    <UserInfoSidebar user={post.user} />
                </Suspense>
            </div>
        </main>
    );
}

interface UserInfoSidebarProps {
    user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) return;

    return (
        <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
            <h2 className="text-xl font-bold">About this user</h2>
            <UserToolTip user={user}>
                <Link
                    href={`/users/${user.username}`}
                    className="flex items-center gap-3"
                >
                    <Avatar
                        src={user.avatarUrl}
                        fallback={user.username}
                        className="flex-none"
                    />
                    <div>
                        <p className="line-clamp-1 break-all font-semibold hover:underline">
                            {user.displayName}
                        </p>
                        <p className="line-clamp-1 break-all text-muted-foreground">
                            @{user.username}
                        </p>
                    </div>
                </Link>
            </UserToolTip>
            <Linkify>
                <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
                    {user.bio}
                </div>
            </Linkify>
            {user.id !== loggedInUser.id && (
                <FollowButton
                    userId={user.id}
                    initialState={{
                        followers: user._count.followers,
                        isFollowedByUser: user.followers.some(
                            ({ followerId }) => followerId === loggedInUser.id,
                        ),
                    }}
                />
            )}
        </div>
    );
}
