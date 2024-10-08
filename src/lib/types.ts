import { Prisma } from "@prisma/client";

export function postInclude(loggedInUserId: string) {
    return {
        user: {
            select: selectUserData(loggedInUserId),
        },
        attachments: true,
        likes: {
            where: {
                userId: loggedInUserId,
            },
            select: {
                userId: true,
            },
        },
        bookmarks: {
            where: {
                userId: loggedInUserId,
            },
            select: {
                userId: true,
            },
        },
        _count: {
            select: {
                likes: true,
                comments: true,
            },
        },
    } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
    include: ReturnType<typeof postInclude>;
}>;

export function selectUserData(loggedInUserId: string) {
    return {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        followers: {
            where: {
                followerId: loggedInUserId,
            },
            select: {
                followerId: true,
            },
        },
        _count: {
            select: {
                followers: true,
                posts: true,
            },
        },
    } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
    select: ReturnType<typeof selectUserData>;
}>;

export function commentInclude(loggedInUserId: string) {
    return {
        user: {
            select: selectUserData(loggedInUserId),
        },
    } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
    include: ReturnType<typeof commentInclude>;
}>;

export const notificationsInclude = {
    issuer: {
        select: {
            username: true,
            displayName: true,
            avatarUrl: true,
        },
    },
    post: {
        select: {
            content: true,
        },
    },
} satisfies Prisma.NotificationInclude;

export type NotificationData = Prisma.NotificationGetPayload<{
    include: typeof notificationsInclude;
}>;

export type FollowerInfo = {
    followers: number;
    isFollowedByUser: boolean;
};

export type LikeInfo = {
    likes: number;
    isLikedByUser: boolean;
};

export type BookmarkInfo = {
    isBookmarkedByUser: boolean;
};

export type NotificationCount = {
    unreadCount: number;
};

export type MessageCount = {} & NotificationCount;
