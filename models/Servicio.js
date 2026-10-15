const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  tipo: {
    type: String,
    required: true,
    trim: true
  },
  sesionesTotales: {
    type: Number,
    required: true,
    min: 1
  },
  sesionesConsumidas: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Servicio', servicioSchema);