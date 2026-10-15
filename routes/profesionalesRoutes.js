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

router.get("/", esAutenticado, permitirRoles('paciente', 'medico', 'administrativo'), obtenerProfesionales);
router.get("/:id", esAutenticado, permitirRoles('paciente', 'medico', 'administrativo'), obtenerProfesionalPorId);

router.post("/", esAutenticado, permitirRoles('administrativo'), crearProfesional);
router.put("/:id", esAutenticado, permitirRoles('administrativo'), actualizarProfesional);
router.delete("/:id", esAutenticado, permitirRoles('administrativo'), eliminarProfesional);


export default router;
