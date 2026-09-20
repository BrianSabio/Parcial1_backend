const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Servicio = require('../models/Servicio');

const filePath = path.join(__dirname, '../data/servicios.json');

const readData = () => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data || '[]');
};

const writeData = (data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

exports.obtenerServicios = (req, res, next) => {
  try {
    const servicios = readData();
    res.json(servicios);
  } catch (error) {
    next(error);
  }
};

exports.obtenerServicioById = (req, res, next) => {
  try {
    const { id } = req.params;
    const servicios = readData();
    const servicio = servicios.find(s => s.id === id);

    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    res.json(servicio);
  } catch (error) {
    next(error);
  }
};


exports.crearServicio = (req, res, next) => {
  try {
    const { pacienteId, tipo, sesionesTotales } = req.body;

    if (!pacienteId || !tipo || sesionesTotales === undefined) {
      return res.status(400).json({ mensaje: 'pacienteId, tipo y sesionesTotales son obligatorios' });
    }

    const servicios = readData();

    
    const newServicio = new Servicio(
      crypto.randomUUID(),
      pacienteId,
      tipo,
      parseInt(sesionesTotales),
      0 
    );

    servicios.push(newServicio);
    writeData(servicios);

    res.status(201).json(newServicio);
  } catch (error) {
    next(error);
  }
};

exports.actualizarServicio = (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo, sesionesTotales, sesionesConsumidas } = req.body;

    const servicios = readData();
    const index = servicios.findIndex(s => s.id === id);

    if (index === -1) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }

    if (tipo !== undefined) servicios[index].tipo = tipo;
    if (sesionesTotales !== undefined) servicios[index].sesionesTotales = parseInt(sesionesTotales);
    if (sesionesConsumidas !== undefined) servicios[index].sesionesConsumidas = parseInt(sesionesConsumidas);

    writeData(servicios);
    res.json(servicios[index]);
  } catch (error) {
    next(error);
  }
};

exports.eliminarServicio = (req, res, next) => {
    try {
      const { id } = req.params;
      const servicios = readData();
      const index = servicios.findIndex(s => s.id === id);
  
      if (index === -1) {
        return res.status(404).json({ mensaje: 'Servicio no encontrado' });
      }
  
      const eliminado = servicios.splice(index, 1);
      writeData(servicios);
  
      res.json({ mensaje: 'Servicio eliminado correctamente', servicio: eliminado[0] });
    } catch (error) {
      next(error);
    }
  };

//Acá esta la tercer consulta
exports.obtenerEstadoPaquetePaciente = (req, res, next) => {
    try {
      const { pacienteId } = req.params;
      const servicios = readData();
      const serviciosPaciente = servicios.filter(s => s.pacienteId === pacienteId);
  
      const resumen = serviciosPaciente.map(s => ({
        servicioId: s.id,
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



