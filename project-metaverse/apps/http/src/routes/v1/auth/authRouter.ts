import express from "express"
import { SigninSchema, SignupSchema } from "../../../types";
import client from "@repo/db/client"
import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
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
                role: parseData.data.type == "user" ? "User" : "Admin"
            }
        });
        console.log("newUser", newUser)
        res.status(200).json({
            userId: newUser.id
        })
    } catch (e) {
        console.log(e)
        res.status(400).json({
            err: `Error on signup: ${e}`
        })
    }

})

auth.post('/signin', async (req, res) => {
    const data = req.body;
    const parseData = SigninSchema.safeParse(data);
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
        // const validUser = await bcrypt.compare(parseData.data.password, user.password);
        // if (!validUser) {
        //     res.status(403).json({ msg: "password is not valid" });
        //     return;
        // }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_SECRET);

        res.status(200).json({ token });

    } catch (e) {
        res.status(400).json({
            err: `Error on signin: ${e}`
        })
    }

})


export default auth;