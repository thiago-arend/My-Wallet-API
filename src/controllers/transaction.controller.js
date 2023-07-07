import { transacaoSchema } from "../app.js";
import { db } from "../app.js";
import { ObjectId } from "mongodb";

export async function createTransaction(req, res) {
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
        const sessao = await db.collection("sessions").findOne({ token });
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
}

export async function readTransactions(req, res) {
    const { authorization } = req.headers;

    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const sessao = await db.collection("sessions").findOne({ token });
        if (!sessao) return res.sendStatus(401);

        const transactions = await db.collection("transactions")
            .find({ idUsuario: sessao.idUsuario }).sort({ timestamp: -1 }).toArray();

        res.status(200).send(transactions);

    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function updateTransaction(req, res) {
    const { authorization } = req.headers;
    const { valor, descricao } = req.body;
    const { tipo } = req.params;
    const { idRegistro } = req.query;

    if (!idRegistro) return res.sendStatus(422); // idRegistro é query obrigatória

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
        const sessao = await db.collection("sessions").findOne({ token });
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

        const updated = await db.collection("transactions")
            .updateOne({ _id: new ObjectId(idRegistro) }, { $set: transaction });
        if (updated.matchedCount === 0) return res.sendStatus(404);

        res.sendStatus(204);

    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function deleteTransaction(req, res) {
    const { authorization } = req.headers;
    const { id } = req.params;

    const token = authorization?.replace("Bearer ", "");
    if (!token) return res.sendStatus(401);

    try {
        const sessao = await db.collection("sessions").findOne({ token });
        if (!sessao) return res.sendStatus(401);

        const result = await db.collection("transactions").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.sendStatus(404);
        res.sendStatus(204);

    } catch (err) {
        res.status(500).send(err.message);
    }
}

