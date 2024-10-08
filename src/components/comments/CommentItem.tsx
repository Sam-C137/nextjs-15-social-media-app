import { CommentData } from "@/lib/types";
import UserToolTip from "@/components/shared/UserTooltip";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { relativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import MoreOptions from "@/components/comments/MoreOptions";

interface CommentItemProps {
    comment: CommentData;
}

export default function CommentItem({ comment }: CommentItemProps) {
    const { user } = useSession();

    return (
        <div className="group/comment flex items-center gap-3 py-3">
            <span className="hidden sm:inline">
                <UserToolTip user={comment.user}>
                    <Link href={`/users/${comment.user.username}`}>
                        <Avatar
                            src={comment.user.avatarUrl}
                            fallback={comment.user.username}
                            size={40}
                        />
                    </Link>
                </UserToolTip>
            </span>
            <div>
                <div className="flex items-center gap-1">
                    <UserToolTip user={comment.user}>
                        <Link
                            href={`/users/${comment.user.username}`}
                            className="font-medium hover:underline"
                        >
                            {comment.user.displayName}
                        </Link>
                    </UserToolTip>
                    <span
                        className="text-muted-foreground"
                        suppressHydrationWarning
                    >
                        {relativeDate(comment.createdAt)}
                    </span>
                </div>
                <div>{comment.content}</div>
            </div>
            {comment.user.id === user.id && (
                <MoreOptions
                    comment={comment}
                    className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
                />
            )}
        </div>
    );
}
