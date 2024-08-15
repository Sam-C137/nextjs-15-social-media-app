import { validateRequest } from "@/auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { commentInclude } from "@/lib/types";
import { ReversePaginated } from "@/lib/utils";

export async function GET(
    req: NextRequest,
    {
        params: { postId },
    }: {
        params: {
            postId: string;
        };
    },
) {
    try {
        const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
        const pageSize = 5;

        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const comments = await prisma.comment.findMany({
            where: {
                postId,
            },
            include: commentInclude(user.id),
            orderBy: {
                createdAt: "asc",
            },
            take: -pageSize - 1,
            cursor: cursor
                ? {
                      id: cursor,
                  }
                : undefined,
        });

        const previousCursor =
            comments.length > pageSize ? comments[0].id : null;

        return Response.json(
            new ReversePaginated(
                comments.length > pageSize ? comments.slice(1) : comments,
                previousCursor,
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
