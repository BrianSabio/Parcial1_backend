import Profesional from '../models/Profesional.js';

export const obtenerProfesionales = async (req, res, next) => {
  try {
    const profesionales = await Profesional.find();
    return res.status(200).json(profesionales);
  } catch (error) {
    next(error);
  }
};

export const obtenerProfesionalPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profesional = await Profesional.findById(id);

    if (!profesional) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    return res.status(200).json(profesional);
  } catch (error) {
    next(error);
  }
};

export const crearProfesional = async (req, res, next) => {
  try {
    const { nombre, apellido, especialidad } = req.body;

    if (!nombre || !apellido || !especialidad) {
      return res.status(400).json({
        error: "Los campos nombre, apellido y especialidad son obligatorios"
      });
    }

    const nuevoProfesional = new Profesional({
      nombre,
      apellido,
      especialidad
    });

    const profesionalGuardado = await nuevoProfesional.save();

    return res.status(201).json({
      mensaje: "Profesional creado",
      profesional: profesionalGuardado
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarProfesional = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profesionalActualizado = await Profesional.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!profesionalActualizado) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    return res.status(200).json({
      mensaje: "Profesional actualizado",
      profesional: profesionalActualizado
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarProfesional = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profesionalEliminado = await Profesional.findByIdAndDelete(id);

    if (!profesionalEliminado) {
      return res.status(404).json({ error: "Profesional no encontrado" });
    }

    return res.status(200).json({
      mensaje: "Profesional eliminado",
      profesional: profesionalEliminado
    });
  } catch (error) {
    next(error);
  }
};

export const existeProfesional = async (profesionalId) => {
  const profesional = await Profesional.findById(profesionalId);
  return Boolean(profesional);
};

export const mostrarVistaProfesionales = async (req, res, next) => {
  try {
    const profesionales = await Profesional.find();
    res.render('profesionales', { title: 'Gestión de Profesionales', profesionales });
  } catch (error) {
    next(error);
  }
};