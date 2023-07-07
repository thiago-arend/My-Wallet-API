import { Router } from "express";
import { getUser } from "../controllers/user.controller.js";
import { validateAuth } from "../middlewares/validateAuth.js";

const userRouter = Router();
userRouter.get("/user", validateAuth, getUser);

export default userRouter;