import express from "express";
import {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  cancelarTurno,
  atenderTurno,
  eliminarTurno,
  obtenerTurnosPorPaciente,
  obtenerAgendaProfesional
} from '../controllers/turnosController.js';
import { esAutenticado, permitirRoles } from '../middlewares/loginHandler.js';

const router = express.Router();

router.get('/paciente/:pacienteId', esAutenticado, permitirRoles('paciente', 'medico', 'administrativo'), obtenerTurnosPorPaciente);
router.get('/profesional/:profesionalId', esAutenticado, permitirRoles('medico', 'administrativo'), obtenerAgendaProfesional);
router.get("/", esAutenticado, permitirRoles('medico', 'administrativo'), obtenerTurnos);
router.get("/:id", esAutenticado, permitirRoles('paciente', 'medico', 'administrativo'), obtenerTurnoPorId);
router.post("/", esAutenticado, permitirRoles('paciente', 'administrativo'), crearTurno);
router.put("/:id", esAutenticado, permitirRoles('paciente', 'administrativo'), actualizarTurno);
router.patch("/:id/cancelar", esAutenticado, permitirRoles('paciente', 'administrativo'), cancelarTurno);
router.patch("/:id/atender", esAutenticado, permitirRoles('medico'), atenderTurno);
router.delete("/:id", esAutenticado, permitirRoles('administrativo'), eliminarTurno);

export default router;
