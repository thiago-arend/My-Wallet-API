import joi from "joi";

export const usuarioCadastroSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().min(3).required()
});

export const usuarioLoginSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required()
});