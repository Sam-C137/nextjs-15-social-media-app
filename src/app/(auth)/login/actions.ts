"use server";

import { loginSchema, LoginUserDetails } from "@/lib/validations";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { verify } from "@node-rs/argon2";
import { lucia } from "@/auth";
import { cookies } from "next/headers";

export async function login(
    credentials: LoginUserDetails,
): Promise<Record<"error", string>> {
    try {
        const { username, password } = loginSchema.parse(credentials);

        const existingUser = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            },
        });

        // if the user does not exist, or they created an account with Google
        if (!existingUser || !existingUser.passwordHash) {
            return {
                error: "Incorrect username or password",
            };
        }

        const validPassword = await verify(
            existingUser.passwordHash,
            password,
            {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1,
            },
        );

        if (!validPassword) {
            return {
                error: "Incorrect username or password",
            };
        }

        const session = await lucia.createSession(existingUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
        );

        return redirect("/");
    } catch (e) {
        if (isRedirectError(e)) throw e;
        console.error(e);

        return {
            error: "Something went wrong. Please try again later",
        };
    }
}
