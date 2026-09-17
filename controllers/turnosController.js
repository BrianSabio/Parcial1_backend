const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Turno = require('../models/Turno');

const turnosFilePath = path.join(__dirname, '../data/turnos.json');
const serviciosFilePath = path.join(__dirname, '../data/servicios.json');
const disponibilidadFilePath = path.join(__dirname, '../data/disponibilidad.json');
const pacientesFilePath = path.join(__dirname, '../data/pacientes.json');
const profesionalesFilePath = path.join(__dirname, '../data/profesionales.json');

const readJSON = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
};

const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

const obtenerTurnos = (req, res, next) => {
  try {
    const turnos = readJSON(turnosFilePath);
    res.status(200).json(turnos);
  } catch (error) {
    next(error);
  }
};

const obtenerTurnoPorId = (req, res, next) => {
  try {
    const { id } = req.params;
    const turnos = readJSON(turnosFilePath);
    const turno = turnos.find(t => t.id === id);

    if (!turno) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

    res.status(200).json(turno);
  } catch (error) {
    next(error);
  }
};

const crearTurno = (req, res, next) => {
  try {
    const { pacienteId, profesionalId, servicioId, fecha, hora } = req.body;

    if (!pacienteId || !profesionalId || !servicioId || !fecha || !hora) {
      return res.status(400).json({ 
        mensaje: 'Faltan datos obligatorios (pacienteId, profesionalId, servicioId, fecha, hora)' 
      });
    }

    const servicios = readJSON(serviciosFilePath);
    const servicioIndex = servicios.findIndex(s => s.id === servicioId && s.pacienteId === pacienteId);

    if (servicioIndex === -1) {
      return res.status(404).json({ mensaje: 'El servicio/paquete especificado no pertenece al paciente o no existe' });
    }

    const servicio = servicios[servicioIndex];
    if (servicio.sesionesConsumidas >= servicio.sesionesTotales) {
      return res.status(400).json({ mensaje: 'El paquete de sesiones de este servicio ya se encuentra agotado' });
    }

    const disponibilidades = readJSON(disponibilidadFilePath);
    const estaDisponible = disponibilidades.some(d =>
      d.profesionalId === profesionalId &&
      d.fecha === fecha &&
      d.disponible === true &&
      hora >= d.horaInicio &&
      hora < d.horaFin
    );

    if (!estaDisponible) {
      return res.status(400).json({ mensaje: 'El profesional no posee disponibilidad horaria configurada en ese rango' });
    }

    const turnos = readJSON(turnosFilePath);
    const turnoOcupado = turnos.find(t => 
      t.profesionalId === profesionalId &&
      t.fecha === fecha &&
      t.hora === hora &&
      t.estado !== 'cancelado'
    );

    if (turnoOcupado) {
      return res.status(409).json({ mensaje: 'El profesional ya tiene un turno reservado en ese horario' });
    }

    const nuevoTurno = new Turno(
      crypto.randomUUID(),
      pacienteId,
      profesionalId,
      servicioId,
      fecha,
      hora,
      'reservado'
    );

    servicios[servicioIndex].sesionesConsumidas += 1;
    writeJSON(serviciosFilePath, servicios);

    turnos.push(nuevoTurno);
    writeJSON(turnosFilePath, turnos);

    res.status(201).json({ mensaje: 'Turno creado con éxito', turno: nuevoTurno });

  } catch (error) {
    next(error);
  }
};

const cancelarTurno = (req, res, next) => {
  try {
    const { id } = req.params;
    const turnos = readJSON(turnosFilePath);
    const index = turnos.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

    if (turnos[index].estado !== 'reservado') {
      return res.status(400).json({ 
        mensaje: `El turno no se puede cancelar porque su estado actual es '${turnos[index].estado}'` 
      });
    }

    turnos[index].estado = 'cancelado';

    const servicios = readJSON(serviciosFilePath);
    const servicioIndex = servicios.findIndex(s => s.id === turnos[index].servicioId);
    if (servicioIndex !== -1 && servicios[servicioIndex].sesionesConsumidas > 0) {
      servicios[servicioIndex].sesionesConsumidas -= 1;
      writeJSON(serviciosFilePath, servicios);
    }

    writeJSON(turnosFilePath, turnos);

    res.status(200).json({ mensaje: 'Turno cancelado correctamente', turno: turnos[index] });
  } catch (error) {
    next(error);
  }
};

const atenderTurno = (req, res, next) => {
  try {
    const { id } = req.params;
    const turnos = readJSON(turnosFilePath);
    const index = turnos.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

    if (turnos[index].estado !== 'reservado') {
      return res.status(400).json({ 
        mensaje: `El turno no se puede atender porque su estado actual es '${turnos[index].estado}'` 
      });
    }

    turnos[index].estado = 'atendido';
    writeJSON(turnosFilePath, turnos);

    res.status(200).json({ mensaje: 'Turno marcado como atendido', turno: turnos[index] });
  } catch (error) {
    next(error);
  }
};

const actualizarTurno = (req, res, next) => {
  try {
    const { id } = req.params;
    const { pacienteId, profesionalId, servicioId, fecha, hora, estado } = req.body;
    
    const turnos = readJSON(turnosFilePath);
    const index = turnos.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

    turnos[index] = {
      ...turnos[index],
      pacienteId: pacienteId || turnos[index].pacienteId,
      profesionalId: profesionalId || turnos[index].profesionalId,
      servicioId: servicioId || turnos[index].servicioId,
      fecha: fecha || turnos[index].fecha,
      hora: hora || turnos[index].hora,
      estado: estado || turnos[index].estado
    };

    writeJSON(turnosFilePath, turnos);
    res.status(200).json({ mensaje: 'Turno actualizado correctamente', turno: turnos[index] });
  } catch (error) {
    next(error);
  }
};

const eliminarTurno = (req, res, next) => {
  try {
    const { id } = req.params;
    const turnos = readJSON(turnosFilePath);
    const index = turnos.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Error: Turno no encontrado' });
    }

    const turnoEliminado = turnos.splice(index, 1);
    writeJSON(turnosFilePath, turnos);

    res.status(200).json({ mensaje: 'Turno eliminado permanentemente', turno: turnoEliminado[0] });
  } catch (error) {
    next(error);
  }
};

const mostrarVistaTurnos = (req, res, next) => {
  try {
    const turnos = readJSON(turnosFilePath);
    const pacientes = readJSON(pacientesFilePath);
    const profesionales = readJSON(profesionalesFilePath);

    const turnosCompletos = turnos.map(t => {
      const paciente = pacientes.find(p => p.id === t.pacienteId);
      const profesional = profesionales.find(p => p.id === t.profesionalId);
      return {
        ...t,
        pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Sin especificar',
        profesionalNombre: profesional ? `${profesional.nombre} ${profesional.apellido}` : 'Sin especificar'
      };
    });

    res.render('turnos', { title: 'Gestión de Turnos', turnos: turnosCompletos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  cancelarTurno,
  atenderTurno,
  eliminarTurno,
  mostrarVistaTurnos,
  obtenerTurnosPorPaciente,
  obtenerAgendaProfesional
};


// Consultas 1 y 2 (la tercera está en servicios)
const obtenerTurnosPorPaciente = (req, res, next) => {
    try {
      const { pacienteId } = req.params;
      const turnos = readJSON(turnosFilePath);
      const turnosPaciente = turnos.filter(t => t.pacienteId === pacienteId);
  
      res.status(200).json(turnosPaciente);
    } catch (error) {
      next(error);
    }
  };
  
  
  const obtenerAgendaProfesional = (req, res, next) => {
    try {
      const { profesionalId } = req.params;
      const { fecha } = req.query; 
  
      const turnos = readJSON(turnosFilePath);
      let agenda = turnos.filter(t => t.profesionalId === profesionalId && t.estado !== 'cancelado');
  
      if (fecha) {
        agenda = agenda.filter(t => t.fecha === fecha);
      }
  
      res.status(200).json(agenda);
    } catch (error) {
      next(error);
    }
  };