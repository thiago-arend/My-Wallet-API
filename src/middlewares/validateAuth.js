import { db } from "../database/database.connection.js";

export async function validateAuth(req, res, next) {
    const { authorization } = req.headers;

    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const sessao = await db.collection("sessions").findOne({ token });
        if (!sessao) return res.sendStatus(401);

        res.locals.sessao = sessao; // salva a sessao dentro da resposta para consulta pela prox. função

        next();
    } catch (err) {
        res.status(500).send(err.message);
    }
}