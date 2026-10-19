import mongoose from 'mongoose';

const turnoSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  profesionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profesional',
    required: true
  },
  servicioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servicio',
    required: true
  },
  fecha: {
    type: String,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['reservado', 'confirmado', 'cancelado', 'atendido'],
    default: 'reservado'
  }
}, {
  timestamps: true
});

export default mongoose.model('Turno', turnoSchema);