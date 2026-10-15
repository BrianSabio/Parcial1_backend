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

router.get("/", esAutenticado, permitirRoles('paciente', 'medico', 'administrativo'), obtenerDisponibilidades);
router.get("/:id", esAutenticado, permitirRoles('paciente', 'medico', 'administrativo'), obtenerDisponibilidadById);
router.post("/", esAutenticado, permitirRoles('administrativo', 'medico'), crearDisponibilidad);
router.put("/:id", esAutenticado, permitirRoles('administrativo', 'medico'), actualizarDisponibilidad);
router.delete("/:id", esAutenticado, permitirRoles('administrativo', 'medico'), eliminarDisponibilidad);

export default router;