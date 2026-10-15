import Usuario from '../models/Usuario.js';


export const mostrarLogin = (req, res) => {
  res.render('login', { error: null });
};

export const autenticarUsuario = async (req, res, next) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.render('login', { error: 'Por favor, ingrese usuario y contraseña.' });
    }

    const usuarioEncontrado = await Usuario.findOne({ usuario, estado: 'activo' })
      .populate('pacienteRef')
      .populate('profesionalRef');

    if (!usuarioEncontrado || usuarioEncontrado.password !== password) {
      return res.render('login', { error: 'Credenciales inválidas o usuario inactivo.' });
    }


    res.redirect('/vista/turnos');
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