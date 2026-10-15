import express from "express";
import {
  obtenerPacientes,
  obtenerPacientePorId,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} from '../controllers/pacientesController.js';
import { esAutenticado, permitirRoles } from '../middlewares/loginHandler.js';

const router = express.Router();

router.get("/", esAutenticado, permitirRoles('administrativo', 'medico'), obtenerPacientes);
router.get("/:id", esAutenticado, permitirRoles('administrativo', 'medico'), obtenerPacientePorId);

router.post("/", esAutenticado, permitirRoles('administrativo'), crearPaciente);
router.put("/:id", esAutenticado, permitirRoles('administrativo'), actualizarPaciente);
router.delete("/:id", esAutenticado, permitirRoles('administrativo'), eliminarPaciente);

export default router;
