import { NextRequest } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { Paginated } from "@/lib/utils";
import { postInclude } from "@/lib/types";

export async function GET(req: NextRequest) {
    try {
        const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
        const pageSize = 10;

        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const posts = await prisma.post.findMany({
            where: {
                user: {
                    followers: {
                        some: {
                            followerId: user.id,
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: pageSize + 1,
            cursor: cursor
                ? {
                      id: cursor,
                  }
                : undefined,
            include: postInclude(user.id),
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
