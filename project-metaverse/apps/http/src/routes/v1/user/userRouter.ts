import express from "express"
import { UserMetadataUpdateSchema } from "../../../types";
import client from "@repo/db/client"
import { userMiddleware } from "../../../middleware/user-middleware";

const user = express.Router();

user.post('/metadata', userMiddleware, async (req, res) => {
    const parseData = UserMetadataUpdateSchema.safeParse(req.body);
    if (!parseData) {
        res.status(400).json({
            msg: "Invalid Data send"
        })
        return;
    }
    try {
        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parseData.data?.avatarId
            }
        })

        res.status(200).json({
            msg: "User Metadata Updated",
        })
    } catch (e) {
        res.status(400).json({
            msg: "Error"
        })
    }

});

user.get('/metadata/bulk', userMiddleware, async (req, res) => {
    const userIdsString = (req.query.ids ?? "[]") as string; // string of array of ids
    const userIds = (userIdsString).slice(1, userIdsString.length - 1).split(",");

    const users = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        }, select: {
            avatar: true,
            id: true
        }
    });

    res.json({
        avatars: users.map(m => ({
            userid: m.id,
            avatarId: m.avatar?.imageUrl
        }))
    })

})

export default user;