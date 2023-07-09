import { Router } from "express";
import transactionRouter from "./transaction.routes.js";
import authRouter from "./auth.routes.js";

const router = Router();
router.use(authRouter);
router.use(transactionRouter);

export default router;