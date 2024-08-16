import { NextRequest } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { notificationsInclude } from "@/lib/types";
import { Paginated } from "@/lib/utils";

export async function GET(req: NextRequest) {
    try {
        const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
        const pageSize = 10;

        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                recipientId: user.id,
            },
            include: notificationsInclude,
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
            notifications.length > pageSize ? notifications[pageSize].id : null;

        return Response.json(
            new Paginated(notifications, nextCursor).slice?.(0, pageSize),
        );
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function PATCH() {
    try {
        const { user } = await validateRequest();

        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.notification.updateMany({
            where: {
                recipientId: user.id,
                read: false,
            },
            data: {
                read: true,
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
