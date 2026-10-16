const esAutenticado = (req, res, next) => {
  if (req.session && req.session.usuario) {
    return next();
  }
  
  // Detectar si es una petición AJAX/fetch a API
  if (req.headers['content-type']?.includes('application/json') || 
      req.headers['accept']?.includes('application/json') ||
      req.path.startsWith('/api/')) {
    return res.status(401).json({ mensaje: 'No autenticado' });
  }
  
  // Para vistas HTML, redirigir al login
  return res.redirect('/login');
};


const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      // Detectar si es una petición AJAX/fetch a API
      if (req.headers['content-type']?.includes('application/json') || 
          req.headers['accept']?.includes('application/json') ||
          req.path.startsWith('/api/')) {
        return res.status(401).json({ mensaje: 'No autenticado' });
      }
      return res.redirect('/login');
    }

    if (rolesPermitidos.includes(req.session.usuario.tipo)) {
      return next();
    }

    // Para APIs, responder con JSON
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