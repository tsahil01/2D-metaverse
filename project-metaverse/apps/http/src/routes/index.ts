import express from "express"
import auth from "./v1/auth/authRouter";
import admin from "./v1/admin/adminRouter";
import space from "./v1/space/spaceRouter";
import user from "./v1/user/userRouter";
import client from "@repo/db/client"

const router = express.Router();
router.use('/', auth);
router.use('/admin', admin);
router.use('/space', space);
router.use('/user', user);

router.get("/elements", (req, res) => {
    
})

router.get("/avatars", async (req, res) => {
    const avatars = await client.avatar.findMany();
    res.json({
        avatars
    })
})

export default router