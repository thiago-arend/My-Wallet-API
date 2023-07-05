import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

// conex]ao ao banco
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message));

// schemas
const usuarioCadastroSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
});

const usuarioLoginSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required()
});

const transacaoSchema = joi.object({
    valor: joi.number().positive().required(),
    descricao: joi.string().required(),
    tipo: joi.string().valid("entrada", "saida").required()
});

// endpoints
app.post("/cadastro", async (req, res) => {
    const { nome, email, senha } = req.body;

    const validation = usuarioCadastroSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(det => det.message);
        return res.status(422).send(errors);
    }

    const senhaHash = bcrypt.hashSync(senha, 10);

    try {
        const usuario = await db.collection("users").findOne({ email });
        if (usuario) return res.sendStatus(409);
        await db.collection("users").insertOne({ nome, email, senha: senhaHash });

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }

});

app.post("/", async (req, res) => {
    const { email, senha } = req.body;

    const validation = usuarioLoginSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(det => det.message);
        return res.status(422).send(errors);
    }

    try {
        const usuario = await db.collection("users").findOne({ email });
        if (!usuario) return res.sendStatus(404);
        if (!bcrypt.compareSync(senha, usuario.senha)) return res.sendStatus(401);

        const token = uuid();
        await db.collection("session").insertOne({ token, idUsuario: usuario._id });

        res.status(200).send(token);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post("/nova-transacao/:tipo", async (req, res) => {
    const { authorization } = req.headers;
    const { valor, descricao } = req.body;
    const { tipo } = req.params;

    const validation = transacaoSchema.validate({ ...req.body, tipo }, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(det => det.message);
        return res.status(422).send(errors);
    }

    // **  validação no front uando um mask de valor
    // ** desse modo a validação aqui se torna desnecessária

    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const sessao = await db.collection("session").findOne({ token });
        if (!sessao) return res.sendStatus(401);

        // idIsuario, valor, descricao, tipo
        const totalCentavos = Number(valor) * 100;
        const transaction = { 
            idUsuario: sessao.idUsuario, 
            valor: totalCentavos, 
            descricao, 
            tipo, 
            timestamp: Date.now() 
        };
        await db.collection("transactions").insertOne(transaction);
        res.sendStatus(201);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get("/home", async (req, res) => {
    const { authorization } = req.headers;

    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const sessao = await db.collection("session").findOne({ token });
        if (!sessao) return res.sendStatus(401);

        const usuario = await db.collection("users").findOne({ _id: sessao.idUsuario });
        const transactions = await db.collection("transactions")
            .find({ idUsuario: usuario._id }).sort({ timestamp: -1 }).toArray();

        res.status(200).send({ usuario, transactions });

    } catch (err) {
        res.status(500).send(err.message);
    }

});

app.delete("/logout", async (req, res) => {
    const {authorization} = req.headers;

    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const result = await db.collection("session").deleteOne({ token });
        if (result.deletedCount === 0) return res.sendStatus(404);
        res.sendStatus(204);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(process.env.PORT, () => console.log(`Servidor rodando na porta ${process.env.PORT}`));