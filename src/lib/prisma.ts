import { PrismaClient } from "@prisma/client";

const prismaSingleton = () => {
    return new PrismaClient();
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaSingleton>;
}

const prismaGlobal = globalThis.prismaGlobal ?? prismaSingleton();

export default prismaGlobal;

if (process.env.NODE_ENV !== "production")
    globalThis.prismaGlobal = prismaGlobal;
