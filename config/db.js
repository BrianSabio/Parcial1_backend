import mongoose from 'mongoose';

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a la base de datos MongoDB (CIKIRE)');
    } catch (error) {
        console.error('Error de conexión a MongoDB:', error.message);
        process.exit(1); // Detiene la app si falla la conexión
    }
};

export default conectarDB;