import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import { usuarioLoginSchema, usuarioCadastroSchema } from "../schemas/user.schemas.js";
import { db } from "../database/database.connection.js";

export async function signup(req, res) {
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
}

export async function signin(req, res) {
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
        await db.collection("sessions").insertOne({ token, idUsuario: usuario._id });

        res.status(200).send(token);

    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function signout(req, res) {
    const { authorization } = req.headers;

    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const result = await db.collection("sessions").deleteOne({ token });
        if (result.deletedCount === 0) return res.sendStatus(401); // token não existe => usuário não autorizado
        res.sendStatus(204);

    } catch (err) {
        res.status(500).send(err.message);
    }
}