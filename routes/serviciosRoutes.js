const express = require("express");
const router = express.Router();

const {
  obtenerServicios,
  obtenerServicioById,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  obtenerEstadoPaquetePaciente
} = require("../controllers/serviciosController");



router.get("/", obtenerServicios);
router.get("/:id", obtenerServicioById);
router.post("/", crearServicio);
router.put("/:id", actualizarServicio);
router.delete("/:id", eliminarServicio);
// Consulta 3
router.get("/paciente/:pacienteId/estado", obtenerEstadoPaquetePaciente);

module.exports = router;