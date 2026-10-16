import express from 'express';
import dotenv from 'dotenv';
import conectarDB from './config/db.js';
import session from 'express-session';

// Importación de rutas
import loginRoutes from './routes/loginRoutes.js';
import pacientesRoutes from './routes/pacientesRoutes.js';
import profesionalesRoutes from './routes/profesionalesRoutes.js';
import disponibilidadRoutes from './routes/disponibilidadRoutes.js';
import serviciosRoutes from './routes/serviciosRoutes.js';
import turnosRoutes from './routes/turnosRoutes.js';

// Middleware propio
import errorHandler from './middlewares/errorHandler.js';

// Vistas (Pug)
import { mostrarVistaTurnos } from './controllers/turnosController.js';
import { mostrarVistaPacientes } from './controllers/pacientesController.js';
import { mostrarVistaProfesionales } from './controllers/profesionalesController.js';

dotenv.config();

// Conectar a la base de datos
conectarDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de vistas
app.set("views", "./views");
app.set("view engine", "pug");

// Archivos estáticos
app.use(express.static('public'));

// Parseo de solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'cikire-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 3600000
  }
}));

// Usuario disponible en las vistas
app.use((req, res, next) => {
  res.locals.usuarioLogueado = req.session?.usuario || null;
  next();
});

// Rutas de autenticación
app.use("/login", loginRoutes);

// Rutas de API
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/profesionales", profesionalesRoutes);
app.use("/api/disponibilidad", disponibilidadRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/turnos", turnosRoutes);

// Rutas de vistas
app.get("/vista/turnos", mostrarVistaTurnos);
app.get("/vista/pacientes", mostrarVistaPacientes);
app.get("/vista/profesionales", mostrarVistaProfesionales);

// Manejo de errores
app.use(errorHandler);

// Arranque del servidor
app.listen(PORT, () => {
  console.log("Servidor CIKIRE corriendo en puerto " + PORT);
});