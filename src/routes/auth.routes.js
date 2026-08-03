import express from "express";
import { getMe, login, logout } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const routerAuth = express.Router();

routerAuth.post("/login", login);
routerAuth.post("/logout", logout);
routerAuth.get("/me", authenticate, getMe);

export default routerAuth;

