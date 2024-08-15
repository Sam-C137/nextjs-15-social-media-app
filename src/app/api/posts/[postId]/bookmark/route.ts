import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { BookmarkInfo } from "@/lib/types";

export async function GET(
    req: Request,
    {
        params: { postId },
    }: {
        params: {
            postId: string;
        };
    },
) {
    try {
        const { user: loggedInUser } = await validateRequest();
        if (!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookmark = await prisma.bookmark.findUnique({
            where: {
                postId_userId: {
                    userId: loggedInUser.id,
                    postId,
                },
            },
        });

        const data: BookmarkInfo = {
            isBookmarkedByUser: Boolean(bookmark),
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
        params: { postId },
    }: {
        params: {
            postId: string;
        };
    },
) {
    try {
        const { user: loggedInUser } = await validateRequest();
        if (!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.bookmark.upsert({
            where: {
                postId_userId: {
                    userId: loggedInUser.id,
                    postId,
                },
            },
            create: {
                userId: loggedInUser.id,
                postId,
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
        params: { postId },
    }: {
        params: {
            postId: string;
        };
    },
) {
    try {
        const { user: loggedInUser } = await validateRequest();
        if (!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.bookmark.deleteMany({
            where: {
                userId: loggedInUser.id,
                postId,
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
