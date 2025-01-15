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
    static: z.boolean(),
    name: z.string().optional()
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

export const GetSpaceSchema = z.object({
    spaceId: z.string()
})

export const ReturnSpaceSchema = z.object({
    dimensions: z.string().regex(/^\d+x\d+$/),
    elements: z.array(z.object({
        id: z.string(),
        element: z.object({
            id: z.string(),
            imageUrl: z.string(),
            static: z.boolean(),
            height: z.number(),
            width: z.number()
        }),
        x: z.number(),
        y: z.number()
    }))
})


export const AddElementToSpaceSchema = z.object({
    elementId: z.string(),
    spaceId: z.string(),
    x: z.number(),
    y: z.number()
})

export const DeleteElementFromSpaceSchema = z.object({
    id: z.string()
})


export const GetMapviaIdSchema = z.object({
    id: z.string()
})


export const UpdateMapSchema = z.object({
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number()
    })).optional()
})