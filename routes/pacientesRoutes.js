const express = require("express");
const router = express.Router();

const {
  obtenerPacientes,
  obtenerPacientePorId,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} = require("../controllers/pacientesController");

router.get("/", obtenerPacientes);
router.get("/:id", obtenerPacientePorId);
router.post("/", crearPaciente);
router.put("/:id", actualizarPaciente);
router.delete("/:id", eliminarPaciente);

module.exports = router;
