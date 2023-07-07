import { db } from "../app.js";

export async function getUser(req, res) {
    const {authorization} = req.headers;

    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const sessao = await db.collection("sessions").findOne({ token });
        if (!sessao) return res.sendStatus(401);

        const user = await db.collection("users").findOne({ _id: sessao.idUsuario });
        if (!user) return res.sendStatus(404);

        delete user.senha;
        res.status(200).send(user);

    } catch (err) {
        res.status(500).send(err.message);
    }
}