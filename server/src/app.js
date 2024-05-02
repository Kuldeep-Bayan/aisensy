import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// handling routes

import userRouter from "./routes/user.routes.js";
// import postRouter from "./routes/post.routes.js";

app.use("/api/v1/users", userRouter);
// app.use("/api/v1/posts", postRouter);

export { app };
