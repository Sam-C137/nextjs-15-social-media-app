"use client";

import { PostData } from "@/lib/types";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { cn, relativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import MoreOptions from "@/components/posts/post-item/MoreOptions";
import Linkify from "@/components/Linkify";
import UserToolTip from "@/components/UserTooltip";
import { Media } from "@prisma/client";
import Image from "next/image";
import LikeButton from "@/components/posts/LikeButton";

interface PostProps {
    post: PostData;
}

export default function PostItem({ post }: PostProps) {
    const { user } = useSession();

    return (
        <article className="group/post space-y-5 rounded-2xl bg-card p-5 shadow-sm">
            <span className="mb-2 flex justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                    <UserToolTip user={post.user}>
                        <Link href={`users/${post.user.username}`}>
                            <Avatar
                                src={post.user.avatarUrl}
                                fallback={post.user.username}
                            />
                        </Link>
                    </UserToolTip>
                    <div>
                        <UserToolTip user={post.user}>
                            <Link
                                href={`users/${post.user.username}`}
                                className="block font-medium hover:underline"
                            >
                                {post.user.displayName}
                            </Link>
                        </UserToolTip>
                        <Link
                            href={`posts/${post.id}`}
                            className="block text-sm text-muted-foreground hover:underline"
                            suppressHydrationWarning
                        >
                            {relativeDate(post.createdAt)}
                        </Link>
                    </div>
                </div>
                {post.userId === user.id && (
                    <MoreOptions
                        post={post}
                        className="opacity-0 transition-opacity group-hover/post:opacity-100"
                    />
                )}
            </span>
            <Linkify>
                <span className="whitespace-pre-line break-words">
                    {post.content}
                </span>
            </Linkify>
            {post.attachments.length > 0 && (
                <MediaPreviews attachments={post.attachments} />
            )}
            <hr className="text-muted-foreground" />
            <LikeButton
                postId={post.id}
                initialState={{
                    likes: post._count.likes,
                    isLikedByUser: post.likes.some(
                        (like) => like.userId === user.id,
                    ),
                }}
            />
        </article>
    );
}

interface MediaPreviewsProps {
    attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3",
                attachments.length > 1 && "sm:grid sm:grid-cols-2",
            )}
        >
            {attachments.map((attachment) => (
                <MediaPreview media={attachment} key={attachment.id} />
            ))}
        </div>
    );
}

interface MediaPreviewProps {
    media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
    if (media.type === "IMAGE") {
        return (
            <Image
                src={media.url}
                alt="Attachment"
                width={300}
                height={500}
                className="mx-auto size-fit max-h-[30rem] rounded-2xl"
            />
        );
    }

    if (media.type === "VIDEO") {
        return (
            <div>
                <video
                    src={media.url}
                    controls
                    className="mx-auto size-fit max-h-[30rem] rounded-2xl"
                />
            </div>
        );
    }

    return <p className="text-destructive">Unsupported media type</p>;
}
