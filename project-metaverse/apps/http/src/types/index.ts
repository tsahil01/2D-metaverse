import z from "zod"

declare global {
    namespace Express {
        export interface Request {
            role?: "Admin" | "User";
            userId?: string;
        }
    }
}

export const SignupSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(4),
    type: z.enum(["user", "admin"])
});

export const SigninSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(4)
});

export const UserMetadataUpdateSchema = z.object({
    avatarId: z.string()
})