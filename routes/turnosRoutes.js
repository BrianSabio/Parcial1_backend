const express = require("express");
const router = express.Router();

const {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  cancelarTurno,
  atenderTurno,
  eliminarTurno
} = require("../controllers/turnosController");

// GET / soporta query params ?profesionalId=, ?fecha=, ?pacienteId=, resueltos en el controller
router.get("/", obtenerTurnos);
router.get("/:id", obtenerTurnoPorId);
router.post("/", crearTurno);
router.put("/:id", actualizarTurno);
router.patch("/:id/cancelar", cancelarTurno);
router.patch("/:id/atender", atenderTurno);
router.delete("/:id", eliminarTurno);

router.get('/paciente/:pacienteId', turnosController.obtenerTurnosPorPaciente);
router.get('/profesional/:profesionalId', turnosController.obtenerAgendaProfesional);

module.exports = router;
