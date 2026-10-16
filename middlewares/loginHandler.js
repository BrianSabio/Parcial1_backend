const esAutenticado = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return next();
  }
  
  // Responder según el tipo de solicitud
  if (req.headers['content-type']?.includes('application/json') || 
      req.headers['accept']?.includes('application/json') ||
      req.path.startsWith('/api/')) {
    return res.status(401).json({ mensaje: 'No autenticado' });
  }
  
  // Redirigir las vistas al login
  return res.redirect('/login');
};


const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      // Responder según el tipo de solicitud
      if (req.headers['content-type']?.includes('application/json') || 
          req.headers['accept']?.includes('application/json') ||
          req.path.startsWith('/api/')) {
        return res.status(401).json({ mensaje: 'No autenticado' });
      }
      return res.redirect('/login');
    }

    if (rolesPermitidos.includes(req.session.usuario.rol)) {
      return next();
    }

    // Responder con JSON para la API
    if (req.headers['content-type']?.includes('application/json') || 
        req.headers['accept']?.includes('application/json') ||
        req.path.startsWith('/api/')) {
      return res.status(403).json({ 
        mensaje: 'Acceso denegado: No tienes los permisos necesarios para realizar esta acción.' 
      });
    }

    return res.status(403).send('Acceso denegado: No tienes los permisos necesarios para realizar esta acción.');
  };
};

export { esAutenticado, permitirRoles };