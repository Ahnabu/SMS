import express from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { UserRole } from "../user/user.interface";
import { ParentController } from "./parent.controller";

const router = express.Router();

// Parent disciplinary actions route
router.get(
  "/disciplinary/actions",
  authenticate,
  authorize(UserRole.PARENT),
  ParentController.getChildDisciplinaryActions
);

export const parentRoutes = router;