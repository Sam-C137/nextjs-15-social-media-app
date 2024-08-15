"use server";

import {
    UpdateProfileDetails,
    updateUserProfileSchema,
} from "@/lib/validations";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { selectUserData } from "@/lib/types";

export async function updateUserProfile(data: UpdateProfileDetails) {
    const { displayName, bio } = updateUserProfileSchema.parse(data);

    const { user } = await validateRequest();
    if (!user) {
        throw new Error("Unauthorized");
    }

    return prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            displayName,
            bio,
        },
        select: selectUserData(user.id),
    });
}
