const express = require("express");
const router = express.Router();

const {
  obtenerDisponibilidad,
  obtenerDisponibilidadPorId,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad
} = require("../controllers/disponibilidadController");

// GET / soporta query params ?profesionalId= y ?fecha=, resueltos dentro del controller
router.get("/", obtenerDisponibilidad);
router.get("/:id", obtenerDisponibilidadPorId);
router.post("/", crearDisponibilidad);
router.put("/:id", actualizarDisponibilidad);
router.delete("/:id", eliminarDisponibilidad);

module.exports = router;
