import express from "express"
import { CreateAvatarSchema } from "../../../types";
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

export default admin;