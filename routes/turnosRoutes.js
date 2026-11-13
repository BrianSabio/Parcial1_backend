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

router.get('/paciente/:pacienteId', esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo', 'coordinador', 'recepcionista', 'director'), obtenerTurnosPorPaciente);
router.get('/profesional/:profesionalId', esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo', 'coordinador', 'recepcionista', 'director'), obtenerAgendaProfesional);
router.get("/", esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo', 'coordinador', 'recepcionista', 'director'), obtenerTurnos);
router.get("/:id", esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo', 'coordinador', 'recepcionista', 'director'), obtenerTurnoPorId);

router.post("/", esAutenticado, permitirRoles('paciente', 'administrativo', 'coordinador', 'recepcionista'), crearTurno);
router.put("/:id", esAutenticado, permitirRoles('paciente', 'administrativo', 'coordinador', 'recepcionista'), actualizarTurno);
router.patch("/:id/cancelar", esAutenticado, permitirRoles('paciente', 'administrativo', 'coordinador', 'recepcionista'), cancelarTurno);
router.patch("/:id/atender", esAutenticado, permitirRoles('profesional'), atenderTurno);
router.delete("/:id", esAutenticado, permitirRoles('administrativo', 'coordinador', 'recepcionista'), eliminarTurno);

export default router;
