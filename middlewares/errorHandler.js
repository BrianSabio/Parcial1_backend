// Manejo centralizado de errores

function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(500).json({
    mensaje: "Ocurrió un error interno en el servidor"
  });
}

export default errorHandler;