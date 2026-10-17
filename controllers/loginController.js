import Usuario from '../models/Usuario.js';


export const mostrarLogin = (req, res) => {
  res.render('login', { title: 'Iniciar Sesión' });
};

export const mostrarVistaRegistro = (req, res) => {
  res.render('registro', { title: 'Crear nuevo usuario' });
};

export const autenticarUsuario = async (req, res, next) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ mensaje: 'Por favor, ingrese usuario y contraseña.' });
    }

    const usuarioEncontrado = await Usuario.findOne({ usuario, estado: 'activo' })
      .populate('pacienteRef')
      .populate('profesionalRef');

    if (!usuarioEncontrado || usuarioEncontrado.password !== password) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos o cuenta inactiva.' });
    }

    req.session.usuario = usuarioEncontrado;
    req.session.userId = usuarioEncontrado._id;

    req.session.save((err) => {
      if (err) return next(err);
      
      res.status(200).json({ 
        mensaje: 'Autenticación exitosa.', 
        usuario: usuarioEncontrado 
      });
    });

  } catch (error) {
    next(error);
  }
};

export const registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, apellido, usuario, password, rol, estado } = req.body;

    const usuarioExistente = await Usuario.findOne({ usuario });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El nombre de usuario ya está en uso.' });
    }

    const nuevoUsuario = new Usuario({nombre, apellido, usuario, password, rol, estado});
    await nuevoUsuario.save();

    return res.status(201).json({ mensaje: 'Usuario registrado correctamente.', usuario: nuevoUsuario });
  } catch (error) {
    next(error);
  }
};

export const cerrarSesion = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
};