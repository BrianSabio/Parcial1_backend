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

dotenv.config();

// Conectar a la base de datos
conectarDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de vistas (Pug)
app.set("views", "./views");
app.set("view engine", "pug");


// Middleware para servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static('public'));

// Middlewares para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uso de express-session para configuración de sesiones
// express-session mantiene la sesión del usuario logueado
// en las peticiones subsecuentes sin recargar credenciales
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

// Middleware para ver el usuario en todas las vistas de Pug
app.use((req, res, next) => {
  res.locals.usuarioLogueado = req.session?.usuario || null;
  next();
});

// RUTAS DE AUTENTICACIÓN
app.use("/login", loginRoutes);

// RUTAS DE API (devuelven JSON)
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/profesionales", profesionalesRoutes);
app.use("/api/disponibilidad", disponibilidadRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/turnos", turnosRoutes);

// RUTAS DE VISTAS (renderizan Pug)
app.get("/vista/turnos", mostrarVistaTurnos);

// Middleware de manejo de errores
app.use(errorHandler);

//Arranque del servidor
app.listen(PORT, () => {
  console.log("Servidor CIKIRE corriendo en puerto " + PORT);
});