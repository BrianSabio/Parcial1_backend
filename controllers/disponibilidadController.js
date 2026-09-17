const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const Disponibilidad = require('../models/Disponibilidad');

const filePath = path.join(__dirname, '../data/disponibilidad.json');

const readData = () => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data || '[]');
};

const writeData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

exports.obtenerDisponibilidades = (req, res, next) => {
  try {
    const { profesionalId, fecha } = req.query;
    let disponibilidades = readData();

    if (profesionalId) {
      disponibilidades = disponibilidades.filter(d => d.profesionalId === profesionalId);
    }

    if (fecha) {
      disponibilidades = disponibilidades.filter(d => d.fecha === fecha);
    }

    res.json(disponibilidades);
  } catch (error) {
    next(error);
  }
};

exports.obtenerDisponibilidadById = (req, res, next) => {
  try {
    const { id } = req.params;
    const disponibilidades = readData();
    const disponibilidad = disponibilidades.find(d => d.id === id);

    if (!disponibilidad) {
      return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
    }

    res.json(disponibilidad);
  } catch (error) {
    next(error);
  }
};

exports.crearDisponibilidad = (req, res, next) => {
  try {
    const { profesionalId, fecha, horaInicio, horaFin } = req.body;

    if (!profesionalId || !fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const disponibilidades = readData();

    const conflicto = disponibilidades.some(d => 
      d.profesionalId === profesionalId &&
      d.fecha === fecha &&
      ((horaInicio >= d.horaInicio && horaInicio < d.horaFin) ||
       (horaFin > d.horaInicio && horaFin <= d.horaFin) ||
       (horaInicio <= d.horaInicio && horaFin >= d.horaFin))
    );

    if (conflicto) {
      return res.status(400).json({ mensaje: 'El profesional ya tiene un rango de disponibilidad superpuesto' });
    }

    const newDisponibilidad = new Disponibilidad(
      crypto.randomUUID(),
      profesionalId,
      fecha,
      horaInicio,
      horaFin,
      true
    );

    disponibilidades.push(newDisponibilidad);
    writeData(disponibilidades);

    res.status(201).json(newDisponibilidad);
  } catch (error) {
    next(error);
  }
};

exports.actualizarDisponibilidad = (req, res, next) => {
  try {
    const { id } = req.params;
    const { fecha, horaInicio, horaFin, disponible } = req.body;

    const disponibilidades = readData();
    const index = disponibilidades.findIndex(d => d.id === id);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
    }

    if (fecha !== undefined) disponibilidades[index].fecha = fecha;
    if (horaInicio !== undefined) disponibilidades[index].horaInicio = horaInicio;
    if (horaFin !== undefined) disponibilidades[index].horaFin = horaFin;
    if (disponible !== undefined) disponibilidades[index].disponible = disponible;

    writeData(disponibilidades);
    res.json(disponibilidades[index]);
  } catch (error) {
    next(error);
  }
};

exports.eliminarDisponibilidad = (req, res, next) => {
  try {
    const { id } = req.params;
    const disponibilidades = readData();
    const index = disponibilidades.findIndex(d => d.id === id);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
    }

    const eliminada = disponibilidades.splice(index, 1);
    writeData(disponibilidades);

    res.json({ mensaje: 'Disponibilidad eliminada correctamente', disponibilidad: eliminada[0] });
  } catch (error) {
    next(error);
  }
};