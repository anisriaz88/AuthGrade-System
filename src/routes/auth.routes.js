import express from "express";
import { login, logout } from "../controllers/auth.controller.js";


const routerAuth = express.Router();

routerAuth.post("/login", login);
routerAuth.post("/logout", logout);

export default routerAuth;
