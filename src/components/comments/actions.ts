"use server";

import { commentInclude, PostData } from "@/lib/types";
import { CreateCommentDetails, createCommentSchema } from "@/lib/validations";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function createComment({
    post,
    content,
}: {
    post: PostData;
} & CreateCommentDetails) {
    const { user } = await validateRequest();

    if (!user) throw new Error("Unauthorized");

    const { content: validatedContent } = createCommentSchema.parse({
        content,
    });

    return prisma.comment.create({
        data: {
            content: validatedContent,
            postId: post.id,
            userId: user.id,
        },
        include: commentInclude(user.id),
    });
}

export async function deleteComment(id: string) {
    const { user } = await validateRequest();

    if (!user) throw new Error("Unauthorized");

    const comment = await prisma.comment.findUnique({
        where: {
            id,
        },
    });

    if (!comment) throw new Error("Comment not found");

    if (comment.userId !== user.id)
        throw new Error("You are not authorized to delete this comment");

    return prisma.comment.delete({
        where: { id },
        include: commentInclude(user.id),
    });
}
