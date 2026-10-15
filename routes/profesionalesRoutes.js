import express from "express";
import {
  obtenerProfesionales,
  obtenerProfesionalPorId,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional
} from '../controllers/profesionalesController.js';

const router = express.Router();

router.get("/", obtenerProfesionales);
router.get("/:id", obtenerProfesionalPorId);
router.post("/", crearProfesional);
router.put("/:id", actualizarProfesional);
router.delete("/:id", eliminarProfesional);

export default router;
