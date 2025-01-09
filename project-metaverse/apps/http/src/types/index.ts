import z, { map } from "zod"

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
});

export const CreateAvatarSchema = z.object({
    imageUrl: z.string(),
    name: z.string()

});

export const CreateElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean()
});

export const UpdateElementSchema = z.object({
    imageUrl: z.string(),
});

export const CreateMapSchema = z.object({
    thumbnail: z.string(),
    dimension: z.string().regex(/^\d+x\d+$/),
    name: z.string(),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number()
    }))
});

export const CreateSpaceSchema = z.object({
    name: z.string(),
    dimension: z.string().regex(/^\d+x\d+$/),
    mapId: z.string().optional(),
    thumbnail: z.string().optional()
})

export const DeleteSpaceSchema = z.object({
    spaceId: z.string()
});