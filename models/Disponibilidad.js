import mongoose from 'mongoose';

const disponibilidadSchema = new mongoose.Schema({
  profesionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profesional',
    required: true
  },
  fecha: {
    type: String,
    required: true
  },
  horaInicio: {
    type: String,
    required: true
  },
  horaFin: {
    type: String,
    required: true
  },
  disponible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Disponibilidad', disponibilidadSchema);