const express = require("express");
const router = express.Router();

const {
  obtenerServicios,
  obtenerServicioPorId,
  crearServicio,
  actualizarServicio,
  eliminarServicio
} = require("../controllers/serviciosController");

// GET / soporta query param ?pacienteId=, resuelto dentro del controller
router.get("/", obtenerServicios);
router.get("/:id", obtenerServicioPorId);
router.post("/", crearServicio);
router.put("/:id", actualizarServicio);
router.delete("/:id", eliminarServicio);

module.exports = router;
