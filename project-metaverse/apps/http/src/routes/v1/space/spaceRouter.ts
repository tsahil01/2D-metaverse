import express, { Request, Response } from "express"
import { userMiddleware } from "../../../middleware/user-middleware";
import client from "@repo/db/client"
import { AddElementToSpaceSchema, CreateSpaceSchema, DeleteElementFromSpaceSchema, GetSpaceSchema } from "../../../types";

const space = express.Router();

space.post("/", userMiddleware, async (req: Request, res: Response) => {
    const parseData = CreateSpaceSchema.safeParse(req.body);
    if (!parseData.success) {
        return res.status(400).json({
            msg: "Invalid Data send"
        })
    }

    if (!parseData.data.mapId) {
        const newSpace = await client.space.create({
            data: {
                name: parseData.data.name,
                width: parseInt(parseData.data.dimension.split("x")[0]),
                height: parseInt(parseData.data.dimension.split("x")[1]),
                creatorId: req.userId!
            }
        });

        res.json({ spaceId: newSpace.id })
        return;
    }

    const map = await client.map.findUnique({
        where: {
            id: parseData.data.mapId
        }, select: {
            mapElements: true,
            height: true,
            width: true
        }
    });

    if (!map) {
        return res.status(400).json({
            message: "Map not found"
        })
    }

    const newSpaceWithMapElements = await client.$transaction(async () => {
        const newSpace = await client.space.create({
            data: {
                name: parseData.data.name,
                width: map.width,
                height: map.height,
                creatorId: req.userId!
            }
        });

        await client.spaceElements.createMany({
            data: map.mapElements.map(e => ({
                spaceId: newSpace.id,
                elementId: e.elementId,
                x: e.x!,
                y: e.y!
            }))
        })

        return newSpace;
    });


    return res.status(201).json({
        message: "Space created successfully",
        spaceId: newSpaceWithMapElements.id
    })

});

space.delete("/:spaceId", userMiddleware, async (req, res) => {
    const spaceId = req.params.spaceId;
    const space = await client.space.findUnique({
        where: {
            id: spaceId,
            creatorId: req.userId
        }
    });

    if (!space) {
        return res.status(400).json({
            message: "Space not found"
        })
    }

    if (space.creatorId !== req.userId) {
        return res.status(403).json({
            message: "Unauthorized"
        })
    }

    await client.spaceElements.deleteMany({
        where: {
            spaceId
        }
    })

    await client.space.delete({
        where: {
            id: spaceId
        }
    });
    return res.status(200).json({
        message: "Space deleted successfully"
    })
});

space.get("/all", userMiddleware, async (req, res) => {
    const spaces = await client.space.findMany({
        where: {
            creatorId: req.userId
        }
    });

    return res.json({
        spaces
    })
});

space.get("/:spaceId", userMiddleware, async (req, res) => {
    const parseData = GetSpaceSchema.safeParse(req.params);
    if (!parseData.success) {
        return res.status(400).json({
            msg: "Invalid Data send"
        })
    }

    const space = await client.space.findUnique({
        where: {
            id: parseData.data.spaceId
        }, include: {
            spaceElements: {
                include: {
                    element: true
                }
            }
        }
    });

    if (!space) {
        return res.status(400).json({
            message: "Space not found"
        })
    }

    const elements = space.spaceElements.map(e => {
        return {
            id: e.id,
            elements: {
                id: e.element.id,
                imageUrl: e.element.imageUrl,
                static: e.element.static,
                height: e.element.height,
                width: e.element.width
            },
            x: e.x,
            y: e.y
        }
    })

    return res.status(200).json({
        dimensions: `${space.width}x${space.height}`,
        elements
    })

});

space.post("/element", userMiddleware, async (req, res) => {
    const parseData = AddElementToSpaceSchema.safeParse(req.body);
    if (!parseData.success) {
        return res.status(400).json({
            msg: "Invalid Data send"
        })
    }

    const space = await client.space.findUnique({
        where: {
            id: parseData.data.spaceId,
            creatorId: req.userId
        }
    });

    if (!space) {
        return res.status(400).json({
            message: "Space not found with the given id or creator"
        })
    }

    if (parseData.data.x > space.width || parseData.data.y > space.height) {
        return res.status(400).json({
            message: "Invalid x or y"
        })
    }

    const element = await client.element.findUnique({
        where: {
            id: parseData.data.elementId
        }
    });

    if (!element) {
        return res.status(400).json({
            message: "Element not found"
        })
    }

    const newSpaceElelent = await client.spaceElements.create({
        data: {
            elementId: parseData.data.elementId,
            spaceId: parseData.data.spaceId,
            x: parseData.data.x,
            y: parseData.data.y
        }
    });

    return res.status(200).json({
        message: "Element added to space",
        id: newSpaceElelent.id
    })

});

space.delete("/element/:id", userMiddleware, async (req, res) => {
    const parseData = DeleteElementFromSpaceSchema.safeParse(req.params);
    if (!parseData.success) {
        return res.status(400).json({
            msg: "Invalid Data send"
        })
    }

    const spaceElement = await client.spaceElements.findUnique({
        where: {
            id: parseData.data.id
        }, include: {
            space: true
        }
    });

    if (!spaceElement) {
        return res.status(400).json({
            message: "Space element not found"
        })
    }

    if (spaceElement.space.creatorId !== req.userId) {
        return res.status(403).json({
            message: "Unauthorized"
        })
    }

    await client.spaceElements.delete({
        where: {
            id: parseData.data.id
        }
    });

    return res.status(200).json({
        message: "Element deleted from space"
    })
});

export default space;