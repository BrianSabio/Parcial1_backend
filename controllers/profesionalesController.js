const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const Profesional = require("../models/Profesional");

const dataPath = path.join(__dirname, "../data/profesionales.json");

// --- FUNCIONES AUXILIARES DE PERSISTENCIA ---

const leerProfesionales = () => {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    const registros = JSON.parse(data);
    return registros.map(
      (p) => new Profesional(p.id, p.nombre, p.apellido, p.especialidad)
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const guardarProfesionales = (profesionales) => {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(profesionales, null, 2), "utf-8");
};

// --- CONTROLADORES DE RUTA ---

const obtenerProfesionales = (req, res, next) => {
  try {
    const profesionales = leerProfesionales();
    return res.status(200).json(profesionales);
  } catch (error) {
    next(error);
  }
};

const obtenerProfesionalPorId = (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionales = leerProfesionales();
    const profesional = profesionales.find((p) => p.id === id);

    if (!profesional) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    return res.status(200).json(profesional);
  } catch (error) {
    next(error);
  }
};

const crearProfesional = (req, res, next) => {
  try {
    const { nombre, apellido, especialidad } = req.body;

    if (!nombre || !apellido || !especialidad) {
      return res.status(400).json({
        error: "Los campos nombre, apellido y especialidad son obligatorios"
      });
    }

    const profesionales = leerProfesionales();

    const nuevoProfesional = new Profesional(
      crypto.randomUUID(),
      nombre,
      apellido,
      especialidad
    );

    profesionales.push(nuevoProfesional);
    guardarProfesionales(profesionales);

    return res.status(201).json({
      mensaje: "Profesional creado",
      profesional: nuevoProfesional
    });
  } catch (error) {
    next(error);
  }
};

const actualizarProfesional = (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, especialidad } = req.body;
    const profesionales = leerProfesionales();

    const indice = profesionales.findIndex((p) => p.id === id);
    if (indice === -1) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    const actual = profesionales[indice];
    const actualizado = new Profesional(
      actual.id,
      nombre ?? actual.nombre,
      apellido ?? actual.apellido,
      especialidad ?? actual.especialidad
    );

    profesionales[indice] = actualizado;
    guardarProfesionales(profesionales);

    return res.status(200).json({
      mensaje: "Profesional actualizado",
      profesional: actualizado
    });
  } catch (error) {
    next(error);
  }
};

const eliminarProfesional = (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionales = leerProfesionales();

    const indice = profesionales.findIndex((p) => p.id === id);
    if (indice === -1) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    const [profesionalEliminado] = profesionales.splice(indice, 1);
    guardarProfesionales(profesionales);

    return res.status(200).json({
      mensaje: "Profesional eliminado",
      profesional: profesionalEliminado
    });
  } catch (error) {
    next(error);
  }
};

// --- FUNCIÓN DE APOYO INTERNA ---

const existeProfesional = (profesionalId) => {
  const profesionales = leerProfesionales();
  return profesionales.some((p) => p.id === profesionalId);
};

module.exports = {
  obtenerProfesionales,
  obtenerProfesionalPorId,
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional,
  existeProfesional
};