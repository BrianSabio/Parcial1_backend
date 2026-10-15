import Disponibilidad from '../models/Disponibilidad.js';


export const obtenerDisponibilidades = async (req, res, next) => {
  try {
    const { profesionalId, fecha } = req.query;
    const filtro = {};

    if (profesionalId) filtro.profesionalId = profesionalId;
    if (fecha) filtro.fecha = fecha;

    const disponibilidades = await Disponibilidad.find(filtro)
      .populate('profesionalId', 'nombre apellido especialidad');

    res.json(disponibilidades);
  } catch (error) {
    next(error);
  }
};


export const obtenerDisponibilidadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const disponibilidad = await Disponibilidad.findById(id)
      .populate('profesionalId', 'nombre apellido especialidad');

    if (!disponibilidad) {
      return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
    }

    res.json(disponibilidad);
  } catch (error) {
    next(error);
  }
};

export const crearDisponibilidad = async (req, res, next) => {
  try {
    const { profesionalId, fecha, horaInicio, horaFin } = req.body;

    if (!profesionalId || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

   
    const conflicto = await Disponibilidad.findOne({
      profesionalId,
      fecha,
      $or: [
        { horaInicio: { $lte: horaInicio }, horaFin: { $gt: horaInicio } },
        { horaInicio: { $lt: horaFin }, horaFin: { $gte: horaFin } },
        { horaInicio: { $gte: horaInicio }, horaFin: { $lte: horaFin } }
      ]
    });

    if (conflicto) {
      return res.status(400).json({ 
        mensaje: 'El profesional ya tiene un rango de disponibilidad superpuesto' 
      });
    }

    const nuevaDisponibilidad = new Disponibilidad({
      profesionalId,
      fecha,
      horaInicio,
      horaFin,
      disponible: true
    });

    const disponibilidadGuardada = await nuevaDisponibilidad.save();
    res.status(201).json(disponibilidadGuardada);
  } catch (error) {
    next(error);
  }
};


export const actualizarDisponibilidad = async (req, res, next) => {
  try {
    const { id } = req.params;

    const disponibilidadActualizada = await Disponibilidad.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!disponibilidadActualizada) {
      return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
    }

    res.json(disponibilidadActualizada);
  } catch (error) {
    next(error);
  }
};


export const eliminarDisponibilidad = async (req, res, next) => {
  try {
    const { id } = req.params;

    const disponibilidadEliminada = await Disponibilidad.findByIdAndDelete(id);

    if (!disponibilidadEliminada) {
      return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
    }

    res.json({
      mensaje: 'Disponibilidad eliminada correctamente',
      disponibilidad: disponibilidadEliminada
    });
  } catch (error) {
    next(error);
  }
};