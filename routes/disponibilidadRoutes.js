import express from 'express';
import {
  obtenerDisponibilidades,
  obtenerDisponibilidadById,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad
} from '../controllers/disponibilidadController.js';

const router = express.Router();

router.get("/", obtenerDisponibilidades);
router.get("/:id", obtenerDisponibilidadById);
router.post("/", crearDisponibilidad);
router.put("/:id", actualizarDisponibilidad);
router.delete("/:id", eliminarDisponibilidad);

export default router;