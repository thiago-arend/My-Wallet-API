import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import { signup, signin, signout } from "./controllers/auth.controller.js";
import { createTransaction, readTransactions, updateTransaction, deleteTransaction  } from "./controllers/transaction.controller.js";
import { getUser } from "./controllers/user.controller.js";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

// conex]ao ao banco
const mongoClient = new MongoClient(process.env.DATABASE_URL);
export let db;

mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message));

// schemas
export const usuarioCadastroSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
});

export const usuarioLoginSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required()
});

export const transacaoSchema = joi.object({
    valor: joi.number().positive().required(),
    descricao: joi.string().required(),
    tipo: joi.string().valid("entrada", "saida").required()
});

// endpoints
app.post("/cadastro", signup);
app.post("/", signin);
app.delete("/logout", signout);

app.post("/nova-transacao/:tipo", createTransaction);
app.get("/home", readTransactions);
app.put("/editar-registro/:tipo", updateTransaction);
app.delete("/delete/:id", deleteTransaction);

app.get("/user", getUser);

app.listen(process.env.PORT, () => console.log(`Servidor rodando na porta ${process.env.PORT}`));