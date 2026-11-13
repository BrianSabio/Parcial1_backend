import { Router } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { esAutenticado, permitirRoles } from '../middlewares/loginHandler.js';

const router = Router();

const ROLES_PERMITIDOS_POR_JERARQUIA = {
  director: ['coordinador'],
  coordinador: ['administrativo', 'recepcionista', 'profesional']
};

// Listar usuarios del equipo según jerarquía
router.get('/', esAutenticado, permitirRoles('director', 'coordinador'), async (req, res, next) => {
  try {
    const rolesVisibles = ROLES_PERMITIDOS_POR_JERARQUIA[req.usuario.rol] || [];
    const usuarios = await Usuario.find({ rol: { $in: rolesVisibles } })
      .select('-password')
      .populate('profesionalRef', 'nombre apellido especialidad')
      .sort({ rol: 1, apellido: 1 });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

// Dar de alta usuario según jerarquía
router.post('/', esAutenticado, permitirRoles('director', 'coordinador'), async (req, res, next) => {
  try {
    const { nombre, apellido, usuario, password, rol, profesionalRef } = req.body;
    const rolesPermitidos = ROLES_PERMITIDOS_POR_JERARQUIA[req.usuario.rol] || [];

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ mensaje: `Tu perfil (${req.usuario.rol}) no tiene permiso para crear usuarios con rol ${rol}.` });
    }

    if (!nombre || !apellido || !usuario || !password) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    const existe = await Usuario.findOne({ usuario: usuario.trim() });
    if (existe) {
      return res.status(400).json({ mensaje: 'El nombre de usuario ya está en uso.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      usuario: usuario.trim(),
      password: passwordHash,
      rol,
      estado: 'activo',
      profesionalRef: rol === 'profesional' && profesionalRef ? profesionalRef : null
    });

    const respuesta = nuevoUsuario.toObject();
    delete respuesta.password;
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: respuesta });
  } catch (error) {
    next(error);
  }
});

// Activar / Desactivar usuario
router.patch('/:id/estado', esAutenticado, permitirRoles('director', 'coordinador'), async (req, res, next) => {
  try {
    const { estado } = req.body;
    const usuarioObj = await Usuario.findById(req.params.id);
    if (!usuarioObj) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const rolesPermitidos = ROLES_PERMITIDOS_POR_JERARQUIA[req.usuario.rol] || [];
    if (!rolesPermitidos.includes(usuarioObj.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para modificar este usuario.' });
    }

    usuarioObj.estado = estado;
    await usuarioObj.save();
    res.json({ mensaje: 'Estado actualizado', estado: usuarioObj.estado });
  } catch (error) {
    next(error);
  }
});

export default router;