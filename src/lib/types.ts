import { Prisma } from "@prisma/client";

export const postInclude = {
    user: {
        select: {
            username: true,
            displayName: true,
            avatarUrl: true,
        },
    },
} satisfies Prisma.PostInclude;

export type PostData = Prisma.PostGetPayload<{
    include: typeof postInclude;
}>;

export const userDataSelect = {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
} satisfies Prisma.UserSelect;

// export const  UserData =