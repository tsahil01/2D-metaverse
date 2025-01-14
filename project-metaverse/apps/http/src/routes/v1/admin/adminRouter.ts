import express from "express"
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../../types";
import client from "@repo/db/client";
import { adminMiddleware } from "../../../middleware/admin-middleware";

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
            static: parseData.data.static
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


admin.get(`/map`, adminMiddleware, async (req, res) => {
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

export default admin;