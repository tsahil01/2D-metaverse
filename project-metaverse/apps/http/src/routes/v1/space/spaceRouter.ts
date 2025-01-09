import express, { Request, Response } from "express"
import { userMiddleware } from "../../../middleware/user-middleware";
import client from "@repo/db/client"
import { CreateMapSchema, CreateSpaceSchema } from "../../../types";

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
})

export default space;