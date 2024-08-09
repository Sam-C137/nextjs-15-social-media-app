"use server";

import { creatPostSchema } from "@/lib/validations";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function createPost(post: { content: string }) {
    const { user } = await validateRequest();

    if (!user) throw new Error("Unauthorized");

    const { content } = creatPostSchema.parse(post);

    await prisma.post.create({
        data: {
            content,
            userId: user.id,
        },
    });
}
