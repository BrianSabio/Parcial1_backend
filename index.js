import express from 'express';
import dotenv from 'dotenv';
import conectarDB from './config/db.js';

// Importación de rutas
import pacientesRoutes from './routes/pacientesRoutes.js';
import profesionalesRoutes from './routes/profesionalesRoutes.js';
import disponibilidadRoutes from './routes/disponibilidadRoutes.js';
import serviciosRoutes from './routes/serviciosRoutes.js';
import turnosRoutes from './routes/turnosRoutes.js';

// Middleware propio
import errorHandler from './middlewares/errorHandler.js';

// Vista de turnos (Pug)
import { mostrarVistaTurnos } from './controllers/turnosController.js';

dotenv.config();

// Conectar a la base de datos
conectarDB();

const app = express();
const PORT = 3000;

// Configuración de vistas (Pug)
app.set("views", "./views");
app.set("view engine", "pug");

// Parseo de JSON en el body
app.use(express.json());

// Montaje de rutas de la API
app.use("/pacientes", pacientesRoutes);
app.use("/profesionales", profesionalesRoutes);
app.use("/disponibilidad", disponibilidadRoutes);
app.use("/servicios", serviciosRoutes);
app.use("/turnos", turnosRoutes);

// Vista Pug
app.get("/vista/turnos", mostrarVistaTurnos);

// Middleware de manejo de errores
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Servidor CIKIRE corriendo en puerto " + PORT);
});