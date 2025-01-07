import express from "express"
import { SignupSchema } from "../../../types";

const auth = express.Router();

auth.post('/signup', async (req, res) => {
    const data = req.body;
    const parseData = SignupSchema.safeParse(data);
    if(!parseData.success) {
        console.log("Parse error");
        res.status(400).json({ msg: "Parse error" })
        return;
    }

    try {
        // put data in db
    }

})

export default auth;