import { Router } from "express";
import { login, register, me, logout } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleWare.js";


const authrouter = Router();

authrouter.post("/register", register);
authrouter.post("/login", login);
authrouter.post("/logout", logout);
authrouter.get("/me", authMiddleware, me);

export default authrouter;