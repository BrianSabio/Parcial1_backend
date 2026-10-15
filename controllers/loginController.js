import Usuario from '../models/Usuario.js';


export const mostrarLogin = (req, res) => {
  res.render('login', { title: 'Iniciar Sesión' });
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
      return res.status(401).json({ mensaje: 'Credenciales inválidas o usuario inactivo.' });
    }


    res.status(200).json({ mensaje: 'Autenticación exitosa.', usuario: usuarioEncontrado });
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