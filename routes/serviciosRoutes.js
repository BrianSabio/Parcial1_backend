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


router.get("/", esAutenticado, permitirRoles('paciente', 'medico', 'administrativo'), obtenerServicios);
router.get("/:id", esAutenticado, permitirRoles('paciente', 'medico', 'administrativo'), obtenerServicioById);


router.post("/", esAutenticado, permitirRoles('administrativo'), crearServicio);
router.put("/:id", esAutenticado, permitirRoles('administrativo'), actualizarServicio);
router.delete("/:id", esAutenticado, permitirRoles('administrativo'), eliminarServicio);

// Consulta 3
router.get("/paciente/:pacienteId/estado", esAutenticado, permitirRoles('administrativo', 'paciente'), obtenerEstadoPaquetePaciente);

export default router;