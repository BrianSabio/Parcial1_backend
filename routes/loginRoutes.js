import { Router } from 'express';
import { mostrarLogin, autenticarUsuario, cerrarSesion } from '../controllers/loginController.js';

const router = Router();


router.get('/', mostrarLogin);


router.post('/', autenticarUsuario);


router.get('/logout', cerrarSesion);

export default router;