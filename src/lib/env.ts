import { z } from "zod";

const envSchema = z.object({
    NEXT_PUBLIC_STREAM_KEY: z.string(),
    STREAM_SECRET: z.string(),
    CRON_SECRET: z.string(),
    NEXT_PUBLIC_UPLOADTHING_APP_ID: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    NEXT_PUBLIC_BASE_URL: z.string(),
    UPLOADTHING_TOKEN: z.string(),
});

envSchema.parse(envSchema);

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envSchema> {}
    }
}
