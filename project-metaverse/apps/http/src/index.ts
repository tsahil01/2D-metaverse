import express from "express";
import router from "./routes";

const PORT = process.env.PORT || 3000;
const app = express();

app.use('api/v1', router);

app.listen(PORT, () => console.log(`BE running on port ${PORT}`))