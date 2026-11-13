import mongoose from 'mongoose';

const profesionalSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    especialidad: { type: String, required: true, trim: true },
    matricula: { type: String, trim: true, default: '' },
    telefono: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    estado: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Profesional', profesionalSchema);