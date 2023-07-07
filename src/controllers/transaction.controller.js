import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";

export async function createTransaction(req, res) {
    const { valor, descricao } = req.body;
    const { tipo } = req.params;

    try {
        // idIsuario, valor, descricao, tipo
        const totalCentavos = Number(valor) * 100;
        const transaction = {
            idUsuario: req.sessao.idUsuario,
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

    try {
        const transactions = await db.collection("transactions")
            .find({ idUsuario: req.sessao.idUsuario }).sort({ timestamp: -1 }).toArray();

        res.status(200).send(transactions);

    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function updateTransaction(req, res) {
    const { valor, descricao } = req.body;
    const { tipo } = req.params;
    const { idRegistro } = req.query;

    if (!idRegistro) return res.sendStatus(422); // idRegistro é query obrigatória

    try {
        // idIsuario, valor, descricao, tipo
        const totalCentavos = Number(valor) * 100;
        const transaction = {
            idUsuario: req.sessao.idUsuario,
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
    const { id } = req.params;

    try {
        const result = await db.collection("transactions").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.sendStatus(404);
        res.sendStatus(204);

    } catch (err) {
        res.status(500).send(err.message);
    }
}

