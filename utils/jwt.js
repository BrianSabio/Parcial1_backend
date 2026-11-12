import jwt from 'jsonwebtoken';

const obtenerSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('La variable de entorno JWT_SECRET no está configurada.');
  }

  return secret;
};

const crearToken = (usuario) => {
  return jwt.sign(
    {
      rol: usuario.rol,
      pacienteRef: usuario.pacienteRef?._id || usuario.pacienteRef || null,
      profesionalRef: usuario.profesionalRef?._id || usuario.profesionalRef || null
    },
    obtenerSecret(),
    {
      subject: usuario._id.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  );
};

const verificarToken = (token) => {
  return jwt.verify(token, obtenerSecret());
};

export { crearToken, verificarToken };
