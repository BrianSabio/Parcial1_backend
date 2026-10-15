import express from 'express';
import dotenv from 'dotenv';
import conectarDB from './config/db.js';

// Importación de rutas
import loginRoutes from './routes/loginRoutes.js';
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


// Middleware para servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static('public'));

// Middlewares para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para ver el usuario en todas las vistas de Pug
app.use((req, res, next) => {
res.locals.usuarioLogueado = req.session?.usuario || null; 
  next();
});

// Montaje de rutas de la API
app.use("/login", loginRoutes);
app.use("/pacientes", pacientesRoutes);
app.use("/profesionales", profesionalesRoutes);
app.use("/disponibilidad", disponibilidadRoutes);
app.use("/servicios", serviciosRoutes);
app.use("/turnos", turnosRoutes);

// Vista Pug
app.get("/vista/turnos", mostrarVistaTurnos);

// Middleware de manejo de errores
app.use(errorHandler);

//Arranque del servidor
app.listen(PORT, () => {
  console.log("Servidor CIKIRE corriendo en puerto " + PORT);
});