import { Router } from 'express';
import { mostrarLogin, autenticarUsuario, cerrarSesion, mostrarVistaRegistro, registrarUsuario
} from '../controllers/loginController.js';

const router = Router();

router.get('/', mostrarLogin);
router.get('/registro', mostrarVistaRegistro);
router.get('/logout', cerrarSesion);

router.post('/', autenticarUsuario);
router.post('/registro', registrarUsuario);

export default router;