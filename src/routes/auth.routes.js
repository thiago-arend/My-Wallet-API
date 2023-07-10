import { Router } from "express";
import { signin, signout, signup } from "../controllers/auth.controller.js";
import { validateAuth } from "../middlewares/validateAuth.js";
import validateSchema from "../middlewares/validateSchema.js";
import { usuarioCadastroSchema, usuarioLoginSchema } from "../schemas/user.schemas.js";

const authRouter = Router();
authRouter.post("/cadastro", validateSchema(usuarioCadastroSchema), signup);
authRouter.post("/", validateSchema(usuarioLoginSchema), signin);
authRouter.delete("/logout", validateAuth, signout);

// DATABASE_URL=mongodb://localhost:27017/MyWallet
// mongodb+srv://thiago_arend:tgwENJOUGHlXZF4Q@cluster0.h4wwswa.mongodb.net/MyWallet?retryWrites=true&w=majority

export default authRouter;