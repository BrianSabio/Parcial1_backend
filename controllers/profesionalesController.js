import Profesional from '../models/Profesional.js';

export const obtenerProfesionales = async (req, res, next) => {
  try {
    const { rol, profesionalRef } = req.usuario;
    let filtro = {};
    if (rol === 'profesional') {
      if (!profesionalRef) {
        return res.status(400).json({ error: "El usuario no tiene un perfil de profesional asociado." });
      }
      filtro._id = profesionalRef;
    }
    const profesionales = await Profesional.find(filtro).sort({ apellido: 1, nombre: 1 });
    return res.status(200).json(profesionales);
  } catch (error) {
    next(error);
  }
};

export const obtenerProfesionalPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol, profesionalRef } = req.usuario;
    if (rol === 'profesional' && id !== profesionalRef?.toString()) {
      return res.status(403).json({ error: "Acceso denegado: No tienes permiso para ver la ficha de otro profesional." });
    }

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
    const { nombre, apellido, especialidad, matricula, telefono, email, estado } = req.body;

    if (!nombre || !apellido || !especialidad) {
      return res.status(400).json({
        error: "Los campos nombre, apellido y especialidad son obligatorios"
      });
    }

    const nuevoProfesional = new Profesional({
      nombre,
      apellido,
      especialidad,
      matricula: matricula || '',
      telefono: telefono || '',
      email: email || '',
      estado: estado || 'activo'
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
    const { rol, profesionalRef } = req.usuario;
    let filtro = {};

    if (rol === 'profesional') {
      filtro._id = profesionalRef;
    }

    const profesionales = await Profesional.find(filtro);
    res.render('profesionales', { title: 'Gestión de Profesionales', profesionales });
  } catch (error) {
    next(error);
  }
};