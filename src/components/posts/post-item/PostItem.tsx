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
import BookmarkButton from "@/components/posts/BookmarkButton";
import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import Comments from "@/components/comments/Comments";

interface PostProps {
    post: PostData;
}

export default function PostItem({ post }: PostProps) {
    const { user } = useSession();
    const [showComments, setShowComments] = useState(false);

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
            <div className="flex justify-between gap-5">
                <div className="flex items-center gap-5">
                    <LikeButton
                        postId={post.id}
                        initialState={{
                            likes: post._count.likes,
                            isLikedByUser: post.likes.some(
                                (like) => like.userId === user.id,
                            ),
                        }}
                    />
                    <CommentButton
                        post={post}
                        onClick={() => setShowComments(!showComments)}
                    />
                </div>
                <BookmarkButton
                    postId={post.id}
                    initialState={{
                        isBookmarkedByUser: post.bookmarks.some(
                            ({ userId }) => userId === user.id,
                        ),
                    }}
                />
            </div>
            {showComments && <Comments post={post} />}
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (media.type === "IMAGE") {
        return (
            <>
                <Image
                    src={media.url}
                    alt="Attachment"
                    width={300}
                    height={500}
                    className="mx-auto size-fit max-h-[30rem] cursor-pointer rounded-2xl"
                    onClick={() => {
                        setIsModalOpen(true);
                    }}
                />
                {isModalOpen && (
                    <ImageModal
                        src={media.url}
                        onClose={() => {
                            setIsModalOpen(false);
                        }}
                    />
                )}
            </>
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

interface ImageModalProps {
    src: string;
    onClose: () => void;
}

function ImageModal({ src, onClose }: ImageModalProps) {
    return (
        <div
            onClick={onClose}
            className="screen-fit fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        >
            <div onClick={(e) => e.stopPropagation()} className="relative">
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
                >
                    <X size={20} />
                </button>
                <Image
                    src={src}
                    alt="Expanded Attachment"
                    width={800}
                    height={800}
                    className="rounded-2xl"
                />
            </div>
        </div>
    );
}

interface CommentButtonProps {
    post: PostData;
    onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
    return (
        <button onClick={onClick} className="flex items-center gap-2">
            <MessageSquare className="size-5" />
            <span className="text-sm font-medium tabular-nums">
                {post._count.comments}{" "}
                <span className="hidden sm:inline">
                    {post._count.comments === 1 ? "comment" : "comments"}
                </span>
            </span>
        </button>
    );
}
