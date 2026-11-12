import Usuario from '../models/Usuario.js';
import bcrypt from 'bcrypt';
import { crearToken } from '../utils/jwt.js';

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

    if (!usuarioEncontrado) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos o cuenta inactiva.' });
    }

    const esHashBcrypt = /^\$2[aby]\$\d{2}\$/.test(usuarioEncontrado.password);
    const passwordValida = esHashBcrypt
      ? await bcrypt.compare(password, usuarioEncontrado.password)
      : usuarioEncontrado.password === password;

    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos o cuenta inactiva.' });
    }

    if (!esHashBcrypt) {
      usuarioEncontrado.password = await bcrypt.hash(password, 10);
      await usuarioEncontrado.save();
    }

    const usuarioSesion = usuarioEncontrado.toObject();
    delete usuarioSesion.password;

    const token = crearToken(usuarioEncontrado);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000
    });

    // CAMBIO CLAVE: En lugar de devolver JSON crudo, redirigimos a la vista principal del sistema
    res.redirect('/vista/turnos');

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

    const passwordHash = await bcrypt.hash(password, 10);
    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      usuario,
      password: passwordHash,
      rol,
      estado
    });
    await nuevoUsuario.save();

    const usuarioRegistrado = nuevoUsuario.toObject();
    delete usuarioRegistrado.password;

    // Acá también podés poner res.redirect('/login') si querés que al registrarse vaya al login
    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      usuario: usuarioRegistrado
    });
  } catch (error) {
    next(error);
  }
};

export const cerrarSesion = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};