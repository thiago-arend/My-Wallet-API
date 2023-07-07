import { Router } from "express";
import { createTransaction, deleteTransaction, readTransactions, updateTransaction } from "../controllers/transaction.controller.js";

const transactionRouter = Router();
transactionRouter.post("/nova-transacao/:tipo", createTransaction);
transactionRouter.get("/home", readTransactions);
transactionRouter.put("/editar-registro/:tipo", updateTransaction);
transactionRouter.delete("/delete/:id", deleteTransaction);

export default transactionRouter;