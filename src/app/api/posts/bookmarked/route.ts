import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postInclude } from "@/lib/types";
import { NextRequest } from "next/server";
import { Paginated } from "@/lib/utils";

export async function GET(req: NextRequest) {
    try {
        const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
        const pageSize = 10;

        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId: user.id,
            },
            include: {
                post: {
                    include: postInclude(user.id),
                },
            },
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

        const nextCursor =
            bookmarks.length > pageSize ? bookmarks[pageSize].id : null;

        return Response.json(
            new Paginated(
                bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post),
                nextCursor,
            ),
        );
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
