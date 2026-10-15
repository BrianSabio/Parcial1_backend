import Servicio from '../models/Servicio.js';


export const obtenerServicios = async (req, res, next) => {
  try {
    const servicios = await Servicio.find()
      .populate('pacienteId', 'nombre apellido dni');
      
    res.json(servicios);
  } catch (error) {
    next(error);
  }
};

export const obtenerServicioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findById(id)
      .populate('pacienteId', 'nombre apellido dni');

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(servicio);
  } catch (error) {
    next(error);
  }
};


export const crearServicio = async (req, res, next) => {
  try {
    const { pacienteId, tipo, sesionesTotales } = req.body;

    if (!pacienteId || !tipo || sesionesTotales === undefined) {
      return res.status(400).json({ 
        mensaje: 'pacienteId, tipo y sesionesTotales son obligatorios' 
      });
    }

    const nuevoServicio = new Servicio({
      pacienteId,
      tipo,
      sesionesTotales: Number(sesionesTotales),
      sesionesConsumidas: 0
    });

    const servicioGuardado = await nuevoServicio.save();

    res.status(201).json(servicioGuardado);
  } catch (error) {
    next(error);
  }
};


export const actualizarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const servicioActualizado = await Servicio.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!servicioActualizado) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(servicioActualizado);
  } catch (error) {
    next(error);
  }
};


export const eliminarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const servicioEliminado = await Servicio.findByIdAndDelete(id);

    if (!servicioEliminado) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json({ 
      mensaje: 'Servicio eliminado correctamente', 
      servicio: servicioEliminado 
    });
  } catch (error) {
    next(error);
  }
};


export const obtenerEstadoPaquetePaciente = async (req, res, next) => {
  try {
    const { pacienteId } = req.params;

    const serviciosPaciente = await Servicio.find({ pacienteId });

    const resumen = serviciosPaciente.map(s => ({
      servicioId: s._id,
      tipo: s.tipo,
      sesionesTotales: s.sesionesTotales,
      sesionesConsumidas: s.sesionesConsumidas,
      sesionesRestantes: s.sesionesTotales - s.sesionesConsumidas
    }));

    res.status(200).json(resumen);
  } catch (error) {
    next(error);
  }
};
