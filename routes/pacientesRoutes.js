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

router.get("/", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista', 'profesional', 'director'), obtenerPacientes);
router.get("/:id", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista', 'profesional', 'director'), obtenerPacientePorId);

router.post("/", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista'), crearPaciente);
router.put("/:id", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista'), actualizarPaciente);
router.delete("/:id", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista'), eliminarPaciente);

export default router;