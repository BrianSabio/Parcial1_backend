import Paciente from '../models/Paciente.js';


export const obtenerPacientes = async (req, res, next) => {
  try {
    const pacientes = await Paciente.find();
    return res.status(200).json(pacientes);
  } catch (error) {
    next(error);
  }
};


export const obtenerPacientePorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    if (!paciente) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    return res.status(200).json(paciente);
  } catch (error) {
    next(error);
  }
};


export const crearPaciente = async (req, res, next) => {
  try {
    const { nombre, apellido, dni, telefono, email } = req.body;

    if (!nombre || !apellido || !dni) {
      return res.status(400).json({
        error: "Los campos nombre, apellido y dni son obligatorios"
      });
    }

  
    const dniExistente = await Paciente.findOne({ dni });
    if (dniExistente) {
      return res.status(400).json({
        error: "Ya existe un paciente registrado con ese DNI"
      });
    }

    const nuevoPaciente = new Paciente({
      nombre,
      apellido,
      dni,
      telefono: telefono ?? null,
      email: email ?? null
    });

    const pacienteGuardado = await nuevoPaciente.save();

    return res.status(201).json({
      mensaje: "Paciente creado",
      paciente: pacienteGuardado
    });
  } catch (error) {
    next(error);
  }
};


export const actualizarPaciente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dni } = req.body;

    // Validar DNI duplicado
    if (dni) {
      const dniEnUso = await Paciente.findOne({ dni, _id: { $ne: id } });
      if (dniEnUso) {
        return res.status(400).json({
          error: "El DNI ingresado ya está registrado por otro paciente"
        });
      }
    }

    const pacienteActualizado = await Paciente.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pacienteActualizado) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    return res.status(200).json({
      mensaje: "Paciente actualizado",
      paciente: pacienteActualizado
    });
  } catch (error) {
    next(error);
  }
};


export const eliminarPaciente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pacienteEliminado = await Paciente.findByIdAndDelete(id);

    if (!pacienteEliminado) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }

    return res.status(200).json({
      mensaje: "Paciente eliminado",
      paciente: pacienteEliminado
    });
  } catch (error) {
    next(error);
  }
};

export const existePaciente = async (pacienteId) => {
  const paciente = await Paciente.findById(pacienteId);
  return Boolean(paciente);
};

export const mostrarVistaPacientes = async (req, res, next) => {
  try {
    const pacientes = await Paciente.find();
    res.render('pacientes', { title: 'Gestión de Pacientes', pacientes });
  } catch (error) {
    next(error);
  }
};