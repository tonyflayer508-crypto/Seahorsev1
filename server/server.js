
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectToDatabase } from "./config/db.js";
import authrouter from "./routes/authRoutes.js";
import projectRouter from "./routes/ProjectRoutes.js";

const app = express();

// Connect to MongoDB
await connectToDatabase();

const allowedOrigins = (
    process.env.ORIGINS || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is Live");
});

app.use("/api/auth", authrouter);
app.use("/api/projects", projectRouter);

// Centralized error handler
app.use((err, _req, res, _next) => {
    console.error(`[Error] ${err.message}`);

    const status = err.statusCode || err.status || (err.type === "entity.parse.failed" ? 400 : 500);
    res.status(status).json({
        error: status === 500 ? "Internal server error" : err.message,
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

