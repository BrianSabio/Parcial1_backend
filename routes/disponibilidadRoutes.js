const express = require("express");
const router = express.Router();

const {
  obtenerDisponibilidades,
  obtenerDisponibilidadById,
  crearDisponibilidad,
  actualizarDisponibilidad,
  eliminarDisponibilidad
} = require("../controllers/disponibilidadController");

router.get("/", obtenerDisponibilidades);
router.get("/:id", obtenerDisponibilidadById);
router.post("/", crearDisponibilidad);
router.put("/:id", actualizarDisponibilidad);
router.delete("/:id", eliminarDisponibilidad);

module.exports = router;