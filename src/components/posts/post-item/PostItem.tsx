"use client";

import { PostData } from "@/lib/types";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { relativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import MoreOptions from "@/components/posts/post-item/MoreOptions";

interface PostProps {
    post: PostData;
}

export default function PostItem({ post }: PostProps) {
    const { user } = useSession();

    return (
        <article className="group/post space-y-5 rounded-2xl bg-card p-5 shadow-sm">
            <span className="flex justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                    <Link href={`users/${post.user.username}`}>
                        <Avatar
                            src={post.user.avatarUrl}
                            fallback={post.user.username}
                        />
                    </Link>
                    <div>
                        <Link
                            href={`users/${post.user.username}`}
                            className="block font-medium hover:underline"
                        >
                            {post.user.displayName}
                        </Link>
                        <Link
                            href={`posts/${post.id}`}
                            className="block text-sm text-muted-foreground hover:underline"
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
            <span className="whitespace-pre-line break-words">
                {post.content}
            </span>
        </article>
    );
}
