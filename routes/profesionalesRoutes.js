import express from "express";
import {
  obtenerProfesionales,
  obtenerProfesionalPorId,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional
} from '../controllers/profesionalesController.js';
import { esAutenticado, permitirRoles } from '../middlewares/loginHandler.js';

const router = express.Router();

router.get("/", esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo', 'coordinador', 'recepcionista', 'director'), obtenerProfesionales);
router.get("/:id", esAutenticado, permitirRoles('paciente', 'profesional', 'administrativo', 'coordinador', 'recepcionista', 'director'), obtenerProfesionalPorId);

router.post("/", esAutenticado, permitirRoles('administrativo', 'coordinador', 'director'), crearProfesional);
router.put("/:id", esAutenticado, permitirRoles('administrativo', 'coordinador', 'director'), actualizarProfesional);
router.delete("/:id", esAutenticado, permitirRoles('administrativo', 'coordinador'), eliminarProfesional);

export default router;
