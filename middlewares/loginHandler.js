const esAutenticado = (req, res, next) => {
    if (req.session && req.session.usuario) {
      return next();
    }
    return res.redirect('/login');
  };
  

  const permitirRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
      if (!req.session || !req.session.usuario) {
        return res.redirect('/login');
      }
  
      if (rolesPermitidos.includes(req.session.usuario.rol)) {
        return next();
      }
  
      return res.status(403).send('Acceso denegado: No tienes los permisos necesarios para realizar esta acción.');
    };
  };
  
export { esAutenticado, permitirRoles };