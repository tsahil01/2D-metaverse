import express from "express"
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, GetMapviaIdSchema, UpdateElementSchema, UpdateMapSchema } from "../../../types";
import client from "@repo/db/client";
import { adminMiddleware } from "../../../middleware/admin-middleware";
import { userMiddleware } from "../../../middleware/user-middleware";

const admin = express.Router();

admin.post(`/avatar`, adminMiddleware, async (req, res) => {
    const data = req.body;
    const parseData = CreateAvatarSchema.safeParse(data);
    if (!parseData.success) {
        res.status(400).json({ msg: "Invalid Data send" });
        return;
    }
    const newAvatar = await client.avatar.create({
        data: {
            name: parseData.data.name,
            imageUrl: parseData.data.imageUrl,
        }
    });

    res.json({
        avatarId: newAvatar.id
    })
})

admin.post(`/element`, adminMiddleware, async (req, res) => {
    const data = req.body;
    const parseData = CreateElementSchema.safeParse(data);
    if (!parseData.success) {
        res.status(400).json({ msg: "Invalid Data send" });
        return;
    };

    const newElement = await client.element.create({
        data: {
            imageUrl: parseData.data.imageUrl,
            width: parseData.data.width,
            height: parseData.data.height,
            static: parseData.data.static,
            name: parseData.data.name || "no-name"
        }
    });

    res.json({
        id: newElement.id
    })
});


admin.put(`/element/:id`, adminMiddleware, async (req, res) => {
    const data = req.body;
    const parseData = UpdateElementSchema.safeParse(data);
    if (!parseData.success) {
        res.status(400).json({ msg: "Invalid Data send" });
        return;
    };

    const { id } = req.params;

    const element = await client.element.update({
        where: {
            id
        },
        data: {
            imageUrl: parseData.data.imageUrl
        }
    });

    res.json({
        id: element.id
    })
});

admin.post(`/map`, adminMiddleware, async (req, res) => {
    const parseData = CreateMapSchema.safeParse(req.body);
    if (!parseData.success) {
        res.status(400).json({ msg: "Invalid Data send" });
        return;
    }

    const newMap = await client.map.create({
        data: {
            name: parseData.data.name,
            thumbnail: parseData.data.thumbnail,
            height: parseInt(parseData.data.dimension.split("x")[0]),
            width: parseInt(parseData.data.dimension.split("x")[1]),
            mapElements: {
                create: parseData.data.defaultElements.map((element) => {
                    return {
                        elementId: element.elementId,
                        x: element.x,
                        y: element.y
                    }
                })
            }
        }
    });

    res.json({
        id: newMap.id
    })
});

admin.put(`/map/:id`, adminMiddleware, async (req, res) => {
    const parseData = GetMapviaIdSchema.safeParse(req.params);
    if (!parseData.success) {
        res.status(400).json({ msg: "Invalid Data send" });
        return;
    }

    const data = req.body;
    const parseBody = UpdateMapSchema.safeParse(data);

    if (!parseBody.success) {
        res.status(400).json({ msg: "Invalid Data send" });
        return;
    }

    if((parseBody.data.defaultElements ?? []).length === 0) {
        res.status(400).json({ msg: "Invalid Data send" });
        return;
    }

    const map = await client.map.update({
        where: {
            id: parseData.data.id
        },
        data: {
            mapElements: {
                deleteMany: {},
                create: parseBody.data.defaultElements?.map((element) => {
                    return {
                        elementId: element.elementId,
                        x: element.x,
                        y: element.y
                    }
                })
            }
        }
    });

    res.json({
        id: map.id
    })
   
});


admin.get(`/map`, userMiddleware, async (req, res) => {
    const maps = await client.map.findMany({
        include: {
            mapElements: {
                include: {
                    element: true
                }
            }
        }
    });

    res.json(maps);
});

admin.get(`/map/:id`, userMiddleware, async (req, res) => {
    const parseData = GetMapviaIdSchema.safeParse(req.params);
    if (!parseData.success) {
        res.status(400).json({ msg: "Invalid Data send" });
        return;
    }

    const map = await client.map.findUnique({
        where: {
            id: parseData.data.id
        },
        include: {
            mapElements: {
                include: {
                    element: true
                }
            }
        }
    });

    if (!map) {
        res.status(404).json({ msg: "Map not found" });
        return;
    }

    res.json(map);
});

export default admin;