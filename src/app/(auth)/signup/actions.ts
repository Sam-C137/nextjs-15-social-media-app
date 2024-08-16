"use server";

import { signUpSchema, SignUpUserDetails } from "@/lib/validations";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import prisma from "@/lib/prisma";
import { lucia } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import streamServerClient from "@/lib/stream";

export async function signUp(
    credentials: SignUpUserDetails,
): Promise<Record<"error", string>> {
    try {
        const { username, password, email } = signUpSchema.parse(credentials);

        const passwordHash = await hash(password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });

        const userId = generateIdFromEntropySize(10);

        const existingName = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            },
        });

        if (existingName) {
            return {
                error: "Username already taken",
            };
        }

        const existingEmail = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: "insensitive",
                },
            },
        });

        if (existingEmail) {
            return {
                error: "Email already taken",
            };
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.create({
                data: {
                    id: userId,
                    username,
                    displayName: username,
                    email,
                    passwordHash,
                },
            });

            await streamServerClient.upsertUser({
                id: userId,
                username,
                name: username,
            });
        });

        const session = await lucia.createSession(userId, {});
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
            error: "Something went wrong. Please try again",
        };
    }
}
