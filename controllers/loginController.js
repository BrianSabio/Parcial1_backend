const Usuario = require('../models/Usuario');

class LoginController {
  // Renderizar la pantalla/vista de Login
  static renderLogin(req, res) {
    res.render('login', { error: null });
  }

  // Procesar las credenciales enviadas
  static async login(req, res) {
    try {
      const { usuario, password } = req.body;

      
      const user = await Usuario.findOne({ usuario, password })
        .populate('profesionalRef')
        .populate('pacienteRef');

      if (!user) {
        return res.render('login', { error: 'Usuario o contraseña incorrectos' });
      }

      // Esto se puede sacar, es como para guardar información de la sesión
      req.session.usuario = {
        id: user._id,
        nombre: `${user.nombre} ${user.apellido}`,
        rol: user.rol,
        profesionalId: user.profesionalRef ? user.profesionalRef._id : null,
        pacienteId: user.pacienteRef ? user.pacienteRef._id : null
      };

      
      switch (user.rol) {
        case 'paciente':
          return res.redirect('/turnos/mis-turnos');
        case 'medico':
          return res.redirect('/turnos/mi-agenda');
        case 'administrativo':
          return res.redirect('/pacientes');
        case 'directivo':
          return res.redirect('/admin/dashboard');
        default:
          return res.redirect('/');
      }
    } catch (error) {
      console.error(error);
      res.status(500).render('login', { error: 'Error del servidor al intentar iniciar sesión' });
    }
  }


  static logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
}

module.exports = LoginController;