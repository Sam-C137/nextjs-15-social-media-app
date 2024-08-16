import { createUploadthing, FileRouter } from "uploadthing/next";
import { validateRequest } from "@/auth";
import { UploadThingError } from "@uploadthing/shared";
import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import streamServerClient from "@/lib/stream";

const f = createUploadthing();

export const fileRouter = {
    avatar: f({
        image: {
            maxFileSize: "512KB",
        },
    })
        .middleware(async () => {
            const { user } = await validateRequest();
            if (!user) throw new UploadThingError("Unauthorized");

            return { user };
        })
        .onUploadComplete(async ({ metadata: { user }, file }) => {
            const oldUrl = user.avatarUrl;
            if (oldUrl) {
                const key = oldUrl.split(
                    `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
                )[1];

                await new UTApi().deleteFiles(key);
            }

            const newUrl = file.url.replace(
                "/f/",
                `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
            );

            await Promise.all([
                prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        avatarUrl: newUrl,
                    },
                }),
                streamServerClient.partialUpdateUser({
                    id: user.id,
                    set: {
                        image: newUrl,
                    },
                }),
            ]);

            return {
                avatarUrl: newUrl,
            };
        }),
    attachment: f({
        image: { maxFileSize: "4MB", maxFileCount: 5 },
        video: { maxFileSize: "64MB", maxFileCount: 5 },
    })
        .middleware(async () => {
            const { user } = await validateRequest();

            if (!user) throw new UploadThingError("Unauthorized");

            return {};
        })
        .onUploadComplete(async ({ file }) => {
            const newUrl = file.url.replace(
                "/f/",
                `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
            );

            const media = await prisma.media.create({
                data: {
                    url: newUrl,
                    type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
                },
            });

            return {
                mediaId: media.id,
            };
        }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
