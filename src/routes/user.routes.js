import { Router } from "express";
import { getUser } from "../controllers/user.controller.js";

const userRouter = Router();
userRouter.get("/user", getUser);

export default userRouter;