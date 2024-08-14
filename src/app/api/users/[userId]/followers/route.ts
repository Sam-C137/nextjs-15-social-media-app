import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";

export async function GET(
    req: Request,
    {
        params: { userId },
    }: {
        params: {
            userId: string;
        };
    },
) {
    try {
        const { user: loggedInUser } = await validateRequest();
        if (!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                followers: {
                    where: {
                        followerId: loggedInUser.id,
                    },
                    select: {
                        followerId: true,
                    },
                },
                _count: {
                    select: {
                        followers: true,
                    },
                },
            },
        });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }
        const data: FollowerInfo = {
            followers: user._count.followers,
            isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === loggedInUser.id,
            ),
        };

        return Response.json(data);
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function POST(
    req: Request,
    {
        params: { userId },
    }: {
        params: {
            userId: string;
        };
    },
) {
    try {
        const { user: loggedInUser } = await validateRequest();
        if (!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // query for the row, if relationship does not exist, create, else ignore
        await prisma.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: loggedInUser.id,
                    followingId: userId,
                },
            },
            create: {
                followerId: loggedInUser.id,
                followingId: userId,
            },
            update: {},
        });

        return new Response();
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    req: Request,
    {
        params: { userId },
    }: {
        params: {
            userId: string;
        };
    },
) {
    try {
        const { user: loggedInUser } = await validateRequest();
        if (!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // does not throw an error if field does not exist
        await prisma.follow.deleteMany({
            where: {
                followerId: loggedInUser.id,
                followingId: userId,
            },
        });

        return new Response();
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
