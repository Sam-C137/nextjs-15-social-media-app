import { validateRequest } from "@/auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { postInclude } from "@/lib/types";
import { Paginated } from "@/lib/utils";

export async function GET(
    req: NextRequest,
    {
        params: { userId },
    }: {
        params: {
            userId: string;
        };
    },
) {
    try {
        const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
        const pageSize = 10;

        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const posts = await prisma.post.findMany({
            where: {
                userId,
            },
            include: postInclude(user.id),
            orderBy: {
                createdAt: "desc",
            },
            take: pageSize + 1,
            cursor: cursor
                ? {
                      id: cursor,
                  }
                : undefined,
        });

        const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

        return Response.json(
            new Paginated(posts, nextCursor).slice?.(0, pageSize),
        );
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
