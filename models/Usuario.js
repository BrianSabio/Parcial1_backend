import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  //me gusta usar password para no usar la "ñ", pero si quieren cambiarlo, haganlo. Tener en cuenta que debe sincronizarse con los demás archivos.
  password: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  rol: {
    type: String,
    enum: ['paciente', 'medico', 'administrativo', 'directivo'],
    required: true
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  },

  pacienteRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    default: null
  },
  profesionalRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profesional',
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Usuario', usuarioSchema);