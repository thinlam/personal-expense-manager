import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateBody } from "../../middlewares/validate.middleware";
import { RegisterSchema, LoginSchema } from "./auth.dto";

const router = Router();

router.post("/register", validateBody(RegisterSchema), AuthController.register);
router.post("/login", validateBody(LoginSchema), AuthController.login);

export default router;
