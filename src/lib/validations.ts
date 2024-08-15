import { z } from "zod";

const requiredString = z.string().min(1, "Required");

export const signUpSchema = z.object({
    email: z.string().trim().min(1, "Required").email("Invalid email address"),
    username: requiredString.regex(
        /^[a-zA-Z0-9_-]+$/,
        "Only letters, numbers, - and _ allowed",
    ),
    password: requiredString.min(8, "Must be at least 8 characters"),
});

export type SignUpUserDetails = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
    username: requiredString,
    password: requiredString,
});

export type LoginUserDetails = z.infer<typeof loginSchema>;

export const creatPostSchema = z.object({
    content: requiredString,
    mediaIds: z
        .array(z.string())
        .max(5, "You cannot have more than 5 attachments"),
});

export type CreatePostDetails = z.infer<typeof creatPostSchema>;

export const updateUserProfileSchema = z.object({
    displayName: requiredString,
    bio: z.string().max(1000, "Bio can be at most 1000 characters"),
});

export type UpdateProfileDetails = z.infer<typeof updateUserProfileSchema>;
