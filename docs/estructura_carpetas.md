# Estructura actual de carpetas

La aplicación utiliza una arquitectura MVC liviana sobre Node.js, Express y
Mongoose. Las reglas de negocio están concentradas principalmente en los
controladores; no existe una capa de servicios o repositorios independiente.

```text
Parcial1_backend/
├── index.js                         # Entrada, Express, HTTP, Pug y montaje de rutas
├── package.json                     # Dependencias y scripts start/dev
├── package-lock.json                # Lockfile npm
├── .env.example                     # Variables de entorno de ejemplo
│
├── config/
│   ├── db.js                        # Conexión a MongoDB/Mongoose
│   ├── groq.js                      # Cliente OpenAI-compatible para Groq
│   └── socket.js                    # Inicialización de Socket.IO
│
├── controllers/
│   ├── loginController.js           # Login, registro, logout y vistas de autenticación
│   ├── pacientesController.js       # CRUD y vista de pacientes
│   ├── profesionalesController.js   # CRUD y vista de profesionales
│   ├── disponibilidadController.js  # CRUD y conflictos de horarios
│   ├── serviciosController.js       # Servicios, paquetes y sesiones
│   └── turnosController.js          # Reservas, cancelaciones, agenda y atención
│
├── data/
│   └── informacionCIKIRE.js         # Contexto institucional del asistente
│
├── docs/
│   ├── documento_tecnico.md     # Estado técnico, riesgos y plan recomendado
│   ├── modelo_datos.md              # Entidades, relaciones y reglas de integridad
│   └── estructura_carpetas.md       # Este documento
│
├── middlewares/
│   ├── loginHandler.js              # JWT opcional, autenticación y roles
│   └── errorHandler.js              # Respuesta centralizada ante excepciones
│
├── models/
│   ├── Usuario.js                   # Usuario, rol, estado y referencias
│   ├── Paciente.js                  # Datos del paciente
│   ├── Profesional.js               # Datos y estado del profesional
│   ├── Disponibilidad.js            # Bloques horarios
│   ├── Servicio.js                  # Paquetes y saldo de sesiones
│   └── Turno.js                     # Reserva y estado de atención
│
├── public/
│   ├── css/
│   │   └── style.css                # Estilos de la interfaz
│   ├── img/                         # Logo, favicon e imagen de landing
│   └── js/
│       ├── asistencia.js             # Cliente del chat Socket.IO
│       ├── login.js                  # Login asíncrono
│       ├── registro.js               # Registro asíncrono
│       ├── pacientes.js              # Tabla y alta de pacientes
│       ├── profesionales.js          # Tabla, alta y edición de profesionales
│       ├── turnos.js                # Búsqueda, agenda y reservas
│       └── usuarios.js              # Alta y estado de usuarios internos
│
├── routes/
│   ├── loginRoutes.js               # /login
│   ├── pacientesRoutes.js           # /api/pacientes
│   ├── profesionalesRoutes.js       # /api/profesionales
│   ├── disponibilidadRoutes.js      # /api/disponibilidad
│   ├── serviciosRoutes.js           # /api/servicios
│   ├── turnosRoutes.js              # /api/turnos
│   └── usuariosRoutes.js            # /api/usuarios
│
├── sockets/
│   └── chatSocket.js                # Eventos y reglas del asistente
│
├── utils/
│   └── jwt.js                       # Generación y verificación de JWT
│
└── views/
    ├── layout.pug                  # Layout común y navegación
    ├── inicio.pug                  # Landing institucional
    ├── login.pug                   # Inicio de sesión
    ├── registro.pug                # Registro
    ├── turnos.pug                  # Gestión de turnos
    ├── pacientes.pug               # Gestión de pacientes
    ├── profesionales.pug            # Gestión de profesionales
    ├── usuarios.pug                # Gestión de equipo
    └── asistencia.pug              # Widget de chat incluido por layout
```

## Flujo entre capas

```text
Navegador
  ├── Fetch ──> routes ──> middlewares ──> controllers ──> models ──> MongoDB
  ├── HTTP ──> index.js ──> Pug views
  └── Socket.IO ──> config/socket.js ──> sockets/chatSocket.js ──> Groq
```

## Responsabilidades

- `index.js` configura el proceso y compone la aplicación.
- `routes/` declara endpoints y permisos por rol.
- `middlewares/` interpreta la cookie JWT y responde ante accesos no válidos.
- `controllers/` valida entradas, aplica reglas y ejecuta consultas Mongoose.
- `models/` define esquemas, enums, referencias y validaciones básicas.
- `views/` genera HTML inicial; `public/js/` completa la interacción.
- `sockets/` contiene el flujo de conversación independiente de la API REST.
- `docs/` contiene documentación técnica y de evolución.

## Archivos fuera del control de versiones

`.env` y `node_modules/` están excluidos mediante `.gitignore`. El archivo
`.env.example` documenta las variables esperadas sin contener secretos.
