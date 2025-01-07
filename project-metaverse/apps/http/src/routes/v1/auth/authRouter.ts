import express from "express"
import { SignupSchema } from "../../../types";
import client from "@repo/db/client"
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../..";

const auth = express.Router();

auth.post('/signup', async (req, res) => {
    const data = req.body;
    const parseData = SignupSchema.safeParse(data);
    if (!parseData.success) {
        console.log("Parse error");
        res.status(400).json({ msg: "Parse error" })
        return;
    }

    try {
        const newUser = await client.user.create({
            data: {
                username: parseData.data.username,
                password: parseData.data.password,
                role: parseData.data.type == "user" ? "User" : "Admin",
                avatarId: parseData.data.avatarId
            }
        });
        res.status(200).json({
            userId: newUser.id
        })
    } catch (e) {
        res.status(400).json({
            err: `Error on signup: ${e}`
        })
    }

})

auth.post('/signin', async (req, res) => {
    const data = req.body;
    const parseData = SignupSchema.safeParse(data);
    if (!parseData.success) {
        console.log("Parse error");
        res.status(400).json({ msg: "Parse error" })
        return;
    }
    try {
        const user = await client.user.findFirst({
            where: {
                username: parseData.data.username,
                password: parseData.data.password
            }
        });

        if (!user) {
            res.status(400).json({
                msg: "username or password is not valid"
            })
            return;
        }

        const token = jwt.sign({ user }, JWT_SECRET);
        res.status(200).json({ token });

    } catch (e) {
        res.status(400).json({
            err: `Error on signup: ${e}`
        })
    }

})


export default auth;