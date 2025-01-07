import z from "zod"

export const SignupSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(4),
    type: z.enum(["user", "admin"])
});

export const SigninSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(4)
});