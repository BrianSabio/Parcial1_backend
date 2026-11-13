import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import conectarDB from './config/db.js';
import cookieParser from 'cookie-parser';
import { inicializarSocket } from './config/socket.js';

// Importación de rutas
import loginRoutes from './routes/loginRoutes.js';
import pacientesRoutes from './routes/pacientesRoutes.js';
import profesionalesRoutes from './routes/profesionalesRoutes.js';
import disponibilidadRoutes from './routes/disponibilidadRoutes.js';
import serviciosRoutes from './routes/serviciosRoutes.js';
import turnosRoutes from './routes/turnosRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';

// Middleware propio
import errorHandler from './middlewares/errorHandler.js';
import { cargarUsuarioOpcional, esAutenticado, permitirRoles } from './middlewares/loginHandler.js';

// Vistas (Pug)
import { mostrarVistaTurnos } from './controllers/turnosController.js';
import { mostrarVistaPacientes } from './controllers/pacientesController.js';
import { mostrarVistaProfesionales } from './controllers/profesionalesController.js';

dotenv.config();

// Conectar a la base de datos
conectarDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del servidor HTTP y WebSockets
const server = http.createServer(app);
inicializarSocket(server);

// Configuración de vistas
app.set("views", "./views");
app.set("view engine", "pug");

// Archivos estáticos
app.use(express.static('public'));

// Parseo de solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Usuario disponible en las vistas
app.use(cargarUsuarioOpcional);
app.use((req, res, next) => {
  res.locals.usuarioLogueado = req.usuario || null;
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
app.use("/api/usuarios", usuariosRoutes);

// Rutas de vistas
app.get("/", (req, res) => {
  res.render("inicio");
});

app.get("/vista/turnos", esAutenticado, mostrarVistaTurnos);
app.get(
  "/vista/pacientes",
  esAutenticado,
  permitirRoles('administrativo', 'coordinador', 'recepcionista', 'profesional', 'director'),
  mostrarVistaPacientes
);
app.get(
  "/vista/profesionales",
  esAutenticado,
  permitirRoles('administrativo', 'coordinador', 'recepcionista', 'director'),
  mostrarVistaProfesionales
);
app.get(
  "/vista/usuarios",
  esAutenticado,
  permitirRoles('director', 'coordinador'),
  (req, res) => res.render('usuarios', { title: 'Gestión de Equipo y Usuarios' })
);

// Manejo de errores
app.use(errorHandler);

// Arranque del servidor
server.listen(PORT, () => {
  console.log("Servidor CIKIRE corriendo en puerto " + PORT);
});