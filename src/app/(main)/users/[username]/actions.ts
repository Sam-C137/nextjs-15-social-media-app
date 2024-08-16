"use server";

import {
    UpdateProfileDetails,
    updateUserProfileSchema,
} from "@/lib/validations";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { selectUserData } from "@/lib/types";
import streamServerClient from "@/lib/stream";

export async function updateUserProfile(data: UpdateProfileDetails) {
    const { displayName, bio } = updateUserProfileSchema.parse(data);

    const { user } = await validateRequest();
    if (!user) {
        throw new Error("Unauthorized");
    }

    return prisma.$transaction(async (tx) => {
        const updatedUser = tx.user.update({
            where: {
                id: user.id,
            },
            data: {
                displayName,
                bio,
            },
            select: selectUserData(user.id),
        });

        await streamServerClient.partialUpdateUser({
            id: user.id,
            set: {
                name: displayName,
            },
        });

        return updatedUser;
    });
}
