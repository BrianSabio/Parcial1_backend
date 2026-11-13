import express from "express";
import {
  obtenerServicios,
  obtenerServicioById,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  obtenerEstadoPaquetePaciente
} from '../controllers/serviciosController.js';
import { esAutenticado, permitirRoles } from '../middlewares/loginHandler.js';

const router = express.Router();

router.get("/", esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo', 'coordinador', 'recepcionista', 'director'), obtenerServicios);
router.get("/estado/:pacienteId", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista', 'director', 'paciente'), obtenerEstadoPaquetePaciente);
router.get("/:id", esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo', 'coordinador', 'recepcionista', 'director'), obtenerServicioById);

router.post("/", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista', 'paciente'), crearServicio);
router.put("/:id", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista'), actualizarServicio);
router.delete("/:id", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista'), eliminarServicio);

export default router;