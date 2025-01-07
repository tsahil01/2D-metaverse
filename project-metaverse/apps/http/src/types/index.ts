import z from "zod"

export const SignupSchema = z.object({
    username: z.string(),
    password: z.string(),
    type: z.enum(["user", "admin"]),
    avatarId: z.string()
});

export const SigninSchema = z.object({
    username: z.string(),
    password: z.string()
});