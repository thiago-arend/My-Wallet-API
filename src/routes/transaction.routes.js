import { Router } from "express";
import { createTransaction, deleteTransaction, readTransactions, updateTransaction } from "../controllers/transaction.controller.js";
import { validateAuth } from "../middlewares/validateAuth.js";
import validateSchema from "../middlewares/validateSchema.js";
import { transacaoSchema } from "../schemas/transaction.schemas.js";

const transactionRouter = Router();
transactionRouter.use(validateAuth);

transactionRouter.post("/nova-transacao/:tipo", validateSchema(transacaoSchema), createTransaction);
transactionRouter.get("/home", readTransactions);
transactionRouter.put("/editar-registro/:tipo", validateSchema(transacaoSchema), updateTransaction);
transactionRouter.delete("/delete/:id", deleteTransaction);

export default transactionRouter;