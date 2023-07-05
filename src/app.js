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
        await db.collection("sessao").insertOne({ token, idUsuario: usuario._id });

        res.status(200).send(token);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(process.env.PORT, () => console.log(`Servidor rodando na porta ${process.env.PORT}`));