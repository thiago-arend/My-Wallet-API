import { db } from "../database/database.connection.js";

export async function getUser(req, res) {
    const { idUsuario } = res.locals.sessao;

    try {
        const user = await db.collection("users").findOne({ _id: idUsuario });
        if (!user) return res.sendStatus(404);

        delete user.senha;
        res.status(200).send(user);

    } catch (err) {
        res.status(500).send(err.message);
    }
}