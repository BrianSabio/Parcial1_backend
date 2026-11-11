import { verificarToken } from '../utils/jwt.js';

const esSolicitudApi = (req) => {
  return req.headers['content-type']?.includes('application/json') ||
    req.headers['accept']?.includes('application/json') ||
    req.path.startsWith('/api/');
};

const responderNoAutenticado = (req, res) => {
  if (esSolicitudApi(req)) {
    return res.status(401).json({ mensaje: 'No autenticado' });
  }

  return res.redirect('/login');
};

const esAutenticado = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return responderNoAutenticado(req, res);
  }

  try {
    const payload = verificarToken(token);

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      typeof payload.rol !== 'string'
    ) {
      return responderNoAutenticado(req, res);
    }

    req.usuario = {
      id: payload.sub,
      rol: payload.rol
    };

    return next();
  } catch (error) {
    return responderNoAutenticado(req, res);
  }
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

export { esAutenticado, permitirRoles };
