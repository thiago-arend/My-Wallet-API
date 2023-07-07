import { Router } from "express";
import userRouter from "./user.routes.js";
import transactionRouter from "./transaction.routes.js";
import authRouter from "./auth.routes.js";

const router = Router();
router.use(userRouter);
router.use(transactionRouter);
router.use(authRouter);

export default router;