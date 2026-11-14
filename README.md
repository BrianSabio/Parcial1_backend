# CIKIRE — Sistema de gestión de turnos

Aplicación web monolítica desarrollada para la materia **Desarrollo de
Sistemas Web Back-End 2A** de la **Tecnicatura Superior en Desarrollo de
Software — IFTS 29**. El proyecto fue realizado por el equipo TetraCode:
Berzuini, Flavia; Bustamante, Pedro; Quiroz, Ludmila; y Sabio, Brian.

CIKIRE digitaliza la gestión de pacientes, profesionales, disponibilidades,
servicios/paquetes y turnos de un centro de kinesiología y rehabilitación.

## Estado actual

La versión vigente es un MVP académico funcional con:

- API REST en Express.
- MongoDB mediante Mongoose.
- Vistas Pug y scripts de cliente con Fetch.
- Autenticación JWT en cookie `HttpOnly`.
- Hash de contraseñas con `bcrypt`.
- Autorización por roles.
- Socket.IO y asistente informativo conectado a Groq.
- Landing institucional.

El documento técnico completo se encuentra en
[`docs/documento_tecnico.md`](docs/documento_tecnico.md).

## Tecnologías

| Componente | Tecnología |
|---|---|
| Runtime | Node.js |
| HTTP | Express |
| Base de datos | MongoDB |
| ODM | Mongoose |
| Plantillas | Pug |
| Autenticación | `jsonwebtoken` + `bcrypt` |
| Tiempo real | Socket.IO |
| Asistente | Groq API mediante cliente OpenAI-compatible |
| Configuración | dotenv |
| Desarrollo | nodemon |

La dependencia instalada es `bcrypt`, no `bcryptjs`.

## Arquitectura

El proyecto sigue un MVC liviano:

```text
config/        # MongoDB, Groq y Socket.IO
controllers/   # Reglas de negocio y acceso a datos
data/          # Información institucional del asistente
middlewares/   # JWT, roles y errores
models/        # Esquemas Mongoose
public/        # CSS, imágenes y JavaScript del navegador
routes/        # Endpoints Express
sockets/       # Eventos Socket.IO del chat
utils/         # Utilidades JWT
views/         # Plantillas Pug
docs/          # Documentación técnica
```

La estructura detallada está en
[`docs/estructura_carpetas.md`](docs/estructura_carpetas.md) y el modelo en
[`docs/modelo_datos.md`](docs/modelo_datos.md).

## Funcionalidades

- Registro público de pacientes.
- Login y logout.
- JWT firmado en cookie `HttpOnly`.
- Migración oportunista de contraseñas heredadas a bcrypt.
- Roles: paciente, recepcionista, profesional, administrativo, coordinador y
  director.
- Gestión de pacientes.
- Gestión de profesionales y estado activo/inactivo.
- Gestión de disponibilidades y detección de solapamientos al crear.
- Gestión de servicios y saldo de sesiones.
- Reserva con validación de pertenencia del servicio, saldo, disponibilidad y
  conflicto horario.
- Cancelación con devolución de sesión.
- Atención de turnos por profesionales.
- Alta y estado de usuarios internos con jerarquía.
- Chat institucional con historial máximo de 10 mensajes y límite de 8
  consultas por minuto por conexión.
- Landing institucional con formulario de contacto simulado en el navegador.

## Modelo de dominio

Las entidades principales son `Usuario`, `Paciente`, `Profesional`,
`Disponibilidad`, `Servicio` y `Turno`. Las relaciones usan `ObjectId` de
MongoDB. Los esquemas y sus reglas se describen en
[`docs/modelo_datos.md`](docs/modelo_datos.md).

## Instalación y ejecución

Requisitos:

- Node.js.
- MongoDB local o MongoDB Atlas.
- Clave de Groq para habilitar el chat.

Instalar dependencias:

```bash
npm install
```

Crear `.env` a partir de `.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/cikire
PORT=3000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h
NODE_ENV=development
GROQ_API_KEY=replace-with-your-groq-api-key
```

Iniciar en desarrollo:

```bash
npm run dev
```

Iniciar sin nodemon:

```bash
npm start
```

La aplicación queda disponible por defecto en `http://localhost:3000`.

## Autenticación y autorización

El login valida un usuario activo, compara la contraseña con bcrypt y emite un
JWT. El middleware
[`middlewares/loginHandler.js`](middlewares/loginHandler.js) carga el token,
protege rutas y verifica los roles permitidos.

La cookie utiliza `HttpOnly`, `SameSite=Lax` y `Secure` en producción. El
logout elimina la cookie del navegador. No hay refresh tokens ni lista de
revocación; un token copiado continúa siendo válido hasta expirar. Tampoco se
revalida el estado/rol del usuario contra MongoDB en cada request.

La autorización por rol está implementada a nivel de endpoint, pero la
pertenencia del recurso no está verificada de forma uniforme en todos los
controladores. Esto es deuda técnica conocida y se detalla en el documento de
estado.

## Endpoints

### Login

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/login` | Formulario de login |
| POST | `/login` | Autenticar y emitir JWT |
| GET | `/login/registro` | Formulario de registro |
| POST | `/login/registro` | Registrar paciente o alta autorizada |
| GET | `/login/logout` | Eliminar cookie y redirigir |

### API

| Recurso | Rutas |
|---|---|
| Pacientes | CRUD en `/api/pacientes` |
| Profesionales | CRUD en `/api/profesionales` |
| Disponibilidad | CRUD en `/api/disponibilidad` |
| Servicios | CRUD en `/api/servicios`; estado en `/api/servicios/estado/:pacienteId` |
| Turnos | CRUD en `/api/turnos`; `/cancelar`, `/atender`, consultas por paciente/profesional |
| Usuarios | GET/POST `/api/usuarios`; PATCH `/api/usuarios/:id/estado` |

Detalle de roles por ruta y reglas en
[`docs/estado_actual_sistema.md`](docs/estado_actual_sistema.md).

### Vistas

- `/`
- `/vista/turnos`
- `/vista/pacientes`
- `/vista/profesionales`
- `/vista/usuarios`

## Chat y landing

Socket.IO se inicializa junto con el servidor HTTP. El asistente utiliza
información institucional de [`data/informacionCIKIRE.js`](data/informacionCIKIRE.js)
y consulta Groq desde [`sockets/chatSocket.js`](sockets/chatSocket.js).

El formulario de contacto de la landing es actualmente una simulación de
frontend: muestra confirmación, pero no persiste ni envía el mensaje.

## Pruebas y calidad

La entrega documenta pruebas manuales con Postman sobre el entorno local y el
despliegue. El repositorio no contiene pruebas automatizadas, lint, build ni
CI. La sintaxis JavaScript de los archivos versionados se puede verificar con:

```bash
node --check index.js
```

Para una evaluación completa se recomienda agregar tests de autorización,
reglas de reserva, concurrencia, validaciones y seguridad.

## Seguridad y deuda técnica conocida

- Autorización por pertenencia de recurso incompleta en algunos turnos y
  servicios.
- Reserva y actualización de saldo sin transacción MongoDB.
- Fechas y horas almacenadas como strings sin validación centralizada.
- CORS de Socket.IO abierto y chat sin autenticación.
- Ausencia de CSRF, headers de seguridad y rate limit HTTP global.
- Uso de `innerHTML` con datos externos en scripts del frontend.
- Cobro de consultas particulares no persistente.
- Formulario de contacto sin backend.
- Sin health checks, métricas, auditoría ni backups en el repositorio.

Estas limitaciones no se ocultan: forman parte del estado técnico documentado
para la entrega académica.

## Despliegue informado

La documentación final del equipo informa un despliegue en Render con
MongoDB Atlas:

- GitHub: <https://github.com/BrianSabio/Parcial1_backend>
- Render: <https://parcial1-backend-4bb7.onrender.com/>

El despliegue requiere configurar las variables de entorno fuera del
repositorio.

## Documentación del proyecto

- [`docs/estado_actual_sistema.md`](docs/estado_actual_sistema.md)
- [`docs/estructura_carpetas.md`](docs/estructura_carpetas.md)
- [`docs/modelo_datos.md`](docs/modelo_datos.md)

## Licencia y uso académico

Proyecto académico para la materia Desarrollo de Sistemas Web Back-End 2A.
Las claves, credenciales y datos reales no deben incorporarse al repositorio.
