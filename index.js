const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Rutas de cada entidad
const pacientesRoutes = require("./routes/pacientesRoutes");
const profesionalesRoutes = require("./routes/profesionalesRoutes");
//const disponibilidadRoutes = require("./routes/disponibilidadRoutes");
//const serviciosRoutes = require("./routes/serviciosRoutes");
const turnosRoutes = require("./routes/turnosRoutes");

// Middleware propio
const errorHandler = require("./middlewares/errorHandler");

// Vista de turnos (Pug)
const { mostrarVistaTurnos } = require("./controllers/turnosController");

// Configuración de vistas (Pug)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Parseo de JSON en el body
app.use(express.json());

// Montaje de rutas de la API
app.use("/pacientes", pacientesRoutes);
app.use("/profesionales", profesionalesRoutes);
//app.use("/disponibilidad", disponibilidadRoutes);
//app.use("/servicios", serviciosRoutes);
app.use("/turnos", turnosRoutes);

// Vista Pug
app.get("/vista/turnos", mostrarVistaTurnos);

// Middleware de manejo de errores (siempre al final)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Servidor CIKIRE corriendo en puerto " + PORT);
});
