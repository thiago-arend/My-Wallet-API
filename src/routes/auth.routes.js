import { Router } from "express";
import { signin, signout, signup } from "../controllers/auth.controller.js";

const authRouter = Router();
authRouter.post("/cadastro", signup);
authRouter.post("/", signin);
authRouter.delete("/logout", signout);

export default authRouter;