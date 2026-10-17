import Turno from '../models/Turno.js';
import Servicio from '../models/Servicio.js';
import Disponibilidad from '../models/Disponibilidad.js';


export const obtenerTurnos = async (req, res, next) => {
  try {
    const turnos = await Turno.find()
      .populate('pacienteId', 'nombre apellido dni')
      .populate('profesionalId', 'nombre apellido especialidad')
      .populate('servicioId', 'tipo');

    res.status(200).json(turnos);
  } catch (error) {
    next(error);
  }
};

export const obtenerTurnoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findById(id)
      .populate('pacienteId', 'nombre apellido dni')
      .populate('profesionalId', 'nombre apellido especialidad')
      .populate('servicioId', 'tipo');

    if (!turno) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

    res.status(200).json(turno);
  } catch (error) {
    next(error);
  }
};

export const crearTurno = async (req, res, next) => {
  try {
    const { pacienteId, profesionalId, servicioId, fecha, hora } = req.body;

    if (!pacienteId || !profesionalId || !servicioId || !fecha || !hora) {
      return res.status(400).json({ 
        mensaje: 'Faltan datos obligatorios (pacienteId, profesionalId, servicioId, fecha, hora)' 
      });
    }

    const servicio = await Servicio.findOne({ _id: servicioId, pacienteId });

    if (!servicio) {
      return res.status(404).json({ 
        mensaje: 'El servicio/paquete especificado no pertenece al paciente o no existe' 
      });
    }

    if (servicio.sesionesConsumidas >= servicio.sesionesTotales) {
      return res.status(400).json({ 
        mensaje: 'El paquete de sesiones de este servicio ya se encuentra agotado' 
      });
    }

    const estaDisponible = await Disponibilidad.findOne({
      profesionalId,
      fecha,
      disponible: true,
      horaInicio: { $lte: hora },
      horaFin: { $gt: hora }
    });

    if (!estaDisponible) {
      return res.status(400).json({ 
        mensaje: 'El profesional no posee disponibilidad horaria configurada en ese rango' 
      });
    }

    const turnoOcupado = await Turno.findOne({
      profesionalId,
      fecha,
      hora,
      estado: { $ne: 'cancelado' }
    });

    if (turnoOcupado) {
      return res.status(409).json({ 
        mensaje: 'El profesional ya tiene un turno reservado en ese horario' 
      });
    }

    const nuevoTurno = new Turno({
      pacienteId,
      profesionalId,
      servicioId,
      fecha,
      hora,
      estado: 'reservado'
    });

    servicio.sesionesConsumidas += 1;
    await servicio.save();

    const turnoGuardado = await nuevoTurno.save();

    res.status(201).json({ mensaje: 'Turno creado con éxito', turno: turnoGuardado });
  } catch (error) {
    next(error);
  }
};

export const cancelarTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findById(id);

    if (!turno) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

    if (turno.estado !== 'reservado') {
      return res.status(400).json({ 
        mensaje: `El turno no se puede cancelar porque su estado actual es '${turno.estado}'` 
      });
    }

    turno.estado = 'cancelado';


    const servicio = await Servicio.findById(turno.servicioId);
    if (servicio && servicio.sesionesConsumidas > 0) {
      servicio.sesionesConsumidas -= 1;
      await servicio.save();
    }

    await turno.save();

    res.status(200).json({ mensaje: 'Turno cancelado correctamente', turno });
  } catch (error) {
    next(error);
  }
};

export const atenderTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findById(id);

    if (!turno) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

    if (turno.estado !== 'reservado') {
      return res.status(400).json({ 
        mensaje: `El turno no se puede atender porque su estado actual es '${turno.estado}'` 
      });
    }

    turno.estado = 'atendido';
    await turno.save();

    res.status(200).json({ mensaje: 'Turno marcado como atendido', turno });
  } catch (error) {
    next(error);
  }
};

export const actualizarTurno = async (req, res, next) => {
  try {
    const { id } = req.params;

    const turnoActualizado = await Turno.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!turnoActualizado) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

    res.status(200).json({ mensaje: 'Turno actualizado correctamente', turno: turnoActualizado });
  } catch (error) {
    next(error);
  }
};


export const eliminarTurno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findById(id);

    if (!turno) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

   
    const servicio = await Servicio.findById(turno.servicioId);
    if (servicio && servicio.sesionesConsumidas > 0 && turno.estado === 'reservado') {
      servicio.sesionesConsumidas -= 1;
      await servicio.save();
    }

    await Turno.findByIdAndDelete(id);

    res.status(200).json({ mensaje: 'Turno eliminado permanentemente', turno });
  } catch (error) {
    next(error);
  }
};


export const mostrarVistaTurnos = async (req, res, next) => {
  try {
    const turnos = await Turno.find()
      .populate('pacienteId', 'nombre apellido')
      .populate('profesionalId', 'nombre apellido');

    const turnosCompletos = turnos.map(t => {
      const p = t.pacienteId;
      const prof = t.profesionalId;
      return {
        ...t.toObject(),
        pacienteNombre: p ? `${p.nombre} ${p.apellido}` : 'Sin especificar',
        profesionalNombre: prof ? `${prof.nombre} ${prof.apellido}` : 'Sin especificar'
      };
    });

    res.render('turnos', { title: 'Gestión de Turnos', turnos: turnosCompletos });
  } catch (error) {
    next(error);
  }
};


export const obtenerTurnosPorPaciente = async (req, res, next) => {
  try {
    const { pacienteId } = req.params;
    const turnosPaciente = await Turno.find({ pacienteId })
      .populate('profesionalId', 'nombre apellido especialidad')
      .populate('servicioId', 'tipo');

    res.status(200).json(turnosPaciente);
  } catch (error) {
    next(error);
  }
};


export const obtenerAgendaProfesional = async (req, res, next) => {
  try {
    const { profesionalId } = req.params;
    const { fecha } = req.query;

    const filtro = {
      profesionalId,
      estado: { $ne: 'cancelado' }
    };

    if (fecha) {
      filtro.fecha = fecha;
    }

    const agenda = await Turno.find(filtro)
      .populate('pacienteId', 'nombre apellido dni')
      .populate('servicioId', 'tipo');

    res.status(200).json(agenda);
  } catch (error) {
    next(error);
  }
};