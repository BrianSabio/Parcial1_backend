// Middleware de manejo centralizado de errores.
// Express lo reconoce como error-handler porque recibe 4 parámetros (err, req, res, next).
// Se monta al final de index.js, después de todas las rutas.

function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(500).json({
    mensaje: "Ocurrió un error interno en el servidor"
  });
}

module.exports = errorHandler;