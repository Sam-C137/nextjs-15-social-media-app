"use server";

import { CreatePostDetails, creatPostSchema } from "@/lib/validations";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { postInclude } from "@/lib/types";

export async function createPost(post: CreatePostDetails) {
    const { user } = await validateRequest();

    if (!user) throw new Error("Unauthorized");

    const { content, mediaIds } = creatPostSchema.parse(post);

    return prisma.post.create({
        data: {
            content,
            userId: user.id,
            attachments: {
                connect: mediaIds.map((id) => ({
                    id,
                })),
            },
        },
        include: postInclude(user.id),
    });
}
