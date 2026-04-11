import express from "express";
import { login, logout } from "../Controller/auth.controller.js";
import { authorize } from "../middleware/roles.middleware.js";

const routerAuth = express.Router();

routerAuth.post("/login", login);
routerAuth.post("/logout", logout);

export default routerAuth;
