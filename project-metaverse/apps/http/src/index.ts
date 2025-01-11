import express from "express";
import router from "./routes";
import cors from "cors";

const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || "secret";
const app = express();
app.use(express.json())
app.use(cors())
app.use('/api/v1', router);

app.listen(PORT, () => console.log(`BE running on port ${PORT}`))