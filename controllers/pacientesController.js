const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const Paciente = require("../models/Paciente");

const dataPath = path.join(__dirname, "../data/pacientes.json");

// --- FUNCIONES AUXILIARES DE PERSISTENCIA ---

const leerPacientes = () => {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    const registros = JSON.parse(data);
    return registros.map(
      (p) => new Paciente(p.id, p.nombre, p.apellido, p.dni, p.telefono, p.email)
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};

const guardarPacientes = (pacientes) => {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(pacientes, null, 2), "utf-8");
};

// --- CONTROLADORES DE RUTA ---

const obtenerPacientes = (req, res, next) => {
  try {
    const pacientes = leerPacientes();
    return res.status(200).json(pacientes);
  } catch (error) {
    next(error);
  }
};

const obtenerPacientePorId = (req, res, next) => {
  try {
    const { id } = req.params;
    const pacientes = leerPacientes();
    const paciente = pacientes.find((p) => p.id === id);

    if (!paciente) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    return res.status(200).json(paciente);
  } catch (error) {
    next(error);
  }
};

const crearPaciente = (req, res, next) => {
  try {
    const { nombre, apellido, dni, telefono, email } = req.body;

    if (!nombre || !apellido || !dni) {
      return res.status(400).json({
        error: "Los campos nombre, apellido y dni son obligatorios"
      });
    }

    const pacientes = leerPacientes();

    const dniExistente = pacientes.some((p) => p.dni === dni);
    if (dniExistente) {
      return res.status(400).json({
        error: "Ya existe un paciente registrado con ese DNI"
      });
    }

    const nuevoPaciente = new Paciente(
      crypto.randomUUID(),
      nombre,
      apellido,
      dni,
      telefono ?? null,
      email ?? null
    );

    pacientes.push(nuevoPaciente);
    guardarPacientes(pacientes);

    return res.status(201).json({
      mensaje: "Paciente creado",
      paciente: nuevoPaciente
    });
  } catch (error) {
    next(error);
  }
};

const actualizarPaciente = (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, dni, telefono, email } = req.body;
    const pacientes = leerPacientes();

    const indice = pacientes.findIndex((p) => p.id === id);
    if (indice === -1) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    if (dni && dni !== pacientes[indice].dni) {
      const dniEnUso = pacientes.some((p) => p.dni === dni && p.id !== id);
      if (dniEnUso) {
        return res.status(400).json({
          error: "El DNI ingresado ya está registrado por otro paciente"
        });
      }
    }

    const pacienteActual = pacientes[indice];
    const pacienteActualizado = new Paciente(
      pacienteActual.id,
      nombre ?? pacienteActual.nombre,
      apellido ?? pacienteActual.apellido,
      dni ?? pacienteActual.dni,
      telefono !== undefined ? telefono : pacienteActual.telefono,
      email !== undefined ? email : pacienteActual.email
    );

    pacientes[indice] = pacienteActualizado;
    guardarPacientes(pacientes);

    return res.status(200).json({
      mensaje: "Paciente actualizado",
      paciente: pacienteActualizado
    });
  } catch (error) {
    next(error);
  }
};

const eliminarPaciente = (req, res, next) => {
  try {
    const { id } = req.params;
    const pacientes = leerPacientes();

    const indice = pacientes.findIndex((p) => p.id === id);
    if (indice === -1) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    const [pacienteEliminado] = pacientes.splice(indice, 1);
    guardarPacientes(pacientes);

    return res.status(200).json({
      mensaje: "Paciente eliminado",
      paciente: pacienteEliminado
    });
  } catch (error) {
    next(error);
  }
};

// --- FUNCIÓN DE APOYO INTERNA ---

const existePaciente = (pacienteId) => {
  const pacientes = leerPacientes();
  return pacientes.some((p) => p.id === pacienteId);
};

module.exports = {
  obtenerPacientes,
  obtenerPacientePorId,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
  existePaciente
};