#### Estructura de carpetas

CIKIRE/
│
├── data/                          # Persistencia en JSON
│   ├── pacientes.json
│   ├── profesionales.json
│   ├── disponibilidad.json
│   ├── servicios.json
│   └── turnos.json
│
├── src/
│   ├── models/                    # Clases POO
│   │   ├── Paciente.js
│   │   ├── Profesional.js
│   │   ├── Disponibilidad.js
│   │   ├── Servicio.js
│   │   └── Turno.js
│   │
│   ├── repositories/              # Acceso y persistencia sobre los JSON
│   │   ├── pacienteRepository.js
│   │   ├── profesionalRepository.js
│   │   ├── disponibilidadRepository.js
│   │   ├── servicioRepository.js
│   │   └── turnoRepository.js
│   │
│   ├── controllers/               # Lógica de negocio / manejo de req-res
│   │   ├── pacienteController.js
│   │   ├── profesionalController.js
│   │   ├── disponibilidadController.js
│   │   ├── servicioController.js
│   │   └── turnoController.js
│   │
│   ├── routes/                    # Definición de rutas Express
│   │   ├── pacienteRoutes.js
│   │   ├── profesionalRoutes.js
│   │   ├── disponibilidadRoutes.js
│   │   ├── servicioRoutes.js
│   │   └── turnoRoutes.js
│   │
│   ├── middlewares/                # Middleware propio
│   │   ├── logger.js
│   │   ├── errorHandler.js
│   │   └── validarExistencia.js
│   │
│   ├── views/                      # Plantillas Pug
│   │   ├── layout.pug
│   │   ├── turnos/
│   │   │   ├── lista.pug
│   │   │   └── confirmacion.pug
│   │   └── partials/
│   │       └── navbar.pug
│   │
│   └── utils/                      # Helpers (ids, fechas, etc.)
│       └── idGenerator.js
│
├── app.js                          # Configuración de Express (middlewares, vistas, rutas)
├── server.js                       # Punto de entrada (levanta el servidor)
├── package.json
└── README.md