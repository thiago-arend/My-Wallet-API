import bcrypt from "bcrypt"
import { v4 as uuid } from "uuid"
import { db } from "../database/database.connection.js";

export async function signup(req, res) {
    const { nome, email, senha } = req.body;

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

    try {
        const usuario = await db.collection("users").findOne({ email });
        if (!usuario) return res.sendStatus(404);
        if (!bcrypt.compareSync(senha, usuario.senha)) return res.sendStatus(401);

        await db.collection("sessions").deleteOne({ idUsuario: usuario._id })
        const token = uuid();
        await db.collection("sessions").insertOne({ token, idUsuario: usuario._id });

        res.status(200).send(token);

    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function signout(req, res) {
    const { token } = res.locals.sessao;

    try {
        const result = await db.collection("sessions").deleteOne({ token });
        if (result.deletedCount === 0) return res.sendStatus(404);
        res.sendStatus(204);

    } catch (err) {
        res.status(500).send(err.message);
    }
}