import { verificarToken } from '../utils/jwt.js';

const esSolicitudApi = (req) => {
  return req.headers['content-type']?.includes('application/json') ||
    req.headers['accept']?.includes('application/json') ||
    req.originalUrl.startsWith('/api/');
};

const responderNoAutenticado = (req, res) => {
  if (esSolicitudApi(req)) {
    return res.status(401).json({ mensaje: 'No autenticado' });
  }

  return res.redirect('/login');
};

const cargarUsuarioDesdeToken = (req) => {
  const token = req.cookies?.token;

  if (!token) {
    return false;
  }

  try {
    const payload = verificarToken(token);

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      typeof payload.rol !== 'string'
    ) {
      return false;
    }

    req.usuario = {
      id: payload.sub,
      rol: payload.rol
    };

    return true;
  } catch (error) {
    return false;
  }
};

const cargarUsuarioOpcional = (req, res, next) => {
  cargarUsuarioDesdeToken(req);
  next();
};

const esAutenticado = (req, res, next) => {
  if (!cargarUsuarioDesdeToken(req)) {
    return responderNoAutenticado(req, res);
  }

  return next();
};

const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return responderNoAutenticado(req, res);
    }

    if (rolesPermitidos.includes(req.usuario.rol)) {
      return next();
    }

    if (esSolicitudApi(req)) {
      return res.status(403).json({
        mensaje: 'Acceso denegado: No tienes los permisos necesarios para realizar esta acción.'
      });
    }

    return res.status(403).send(
      'Acceso denegado: No tienes los permisos necesarios para realizar esta acción.'
    );
  };
};

export { cargarUsuarioOpcional, esAutenticado, permitirRoles };
