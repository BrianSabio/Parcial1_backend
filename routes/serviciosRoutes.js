import express from "express";
import {
  obtenerServicios,
  obtenerServicioById,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  obtenerEstadoPaquetePaciente
} from '../controllers/serviciosController.js';

const router = express.Router();

router.get("/", obtenerServicios);
router.get("/:id", obtenerServicioById);
router.post("/", crearServicio);
router.put("/:id", actualizarServicio);
router.delete("/:id", eliminarServicio);
// Consulta 3
router.get("/paciente/:pacienteId/estado", obtenerEstadoPaquetePaciente);

export default router;