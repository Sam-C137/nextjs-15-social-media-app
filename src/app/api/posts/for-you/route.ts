import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postInclude } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
        const pageSize = 10;

        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const posts = await prisma.post.findMany({
            include: postInclude,
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

        return Response.json({
            items: posts.slice(0, pageSize),
            nextCursor,
        });
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
