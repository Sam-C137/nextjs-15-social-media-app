import { NextRequest } from "next/server";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { selectUserData } from "@/lib/types";

export async function GET(
    req: NextRequest,
    {
        params: { username },
    }: {
        params: {
            username: string;
        };
    },
) {
    try {
        const { user: loggedInUser } = await validateRequest();
        if (!loggedInUser) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            },
            select: selectUserData(loggedInUser.id),
        });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        return Response.json(user);
    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
