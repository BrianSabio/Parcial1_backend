import express from 'express';
import {
  obtenerDisponibilidades,
  obtenerDisponibilidadById,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad
} from '../controllers/disponibilidadController.js';
import { esAutenticado, permitirRoles } from '../middlewares/loginHandler.js';

const router = express.Router();

router.get("/", esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo'), obtenerDisponibilidades);
router.get("/:id", esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo'), obtenerDisponibilidadById);
router.post("/", esAutenticado, permitirRoles('administrativo', 'profesional'), crearDisponibilidad);
router.put("/:id", esAutenticado, permitirRoles('administrativo', 'profesional'), actualizarDisponibilidad);
router.delete("/:id", esAutenticado, permitirRoles('administrativo', 'profesional'), eliminarDisponibilidad);

export default router;