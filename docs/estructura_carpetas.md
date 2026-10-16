# Estructura de carpetas

MVC para API REST con persistencia en MongoDB utilizando PUG

```
Proyecto/
├── package.json                    # Configuración del proyecto y dependencias
├── index.js                        # Punto de entrada y servidor Express
│
├── config/
│   └── db.js                       # Conexión con MongoDB
│
├── models/                         # Esquemas de Mongoose
│   ├── Paciente.js
│   ├── Profesional.js
│   ├── Disponibilidad.js
│   ├── Servicio.js
│   ├── Turno.js
│   └── Usuario.js
│
├── controllers/                    # Lógica de negocio / manejo de req-res
│   ├── pacientesController.js
│   ├── profesionalesController.js
│   ├── disponibilidadController.js
│   ├── serviciosController.js
│   ├── turnosController.js
│   └── loginController.js
│
├── routes/                         # Definición de rutas Express
│   ├── loginRoutes.js
│   ├── pacientesRoutes.js
│   ├── profesionalesRoutes.js
│   ├── disponibilidadRoutes.js
│   ├── serviciosRoutes.js
│   └── turnosRoutes.js
│
├── middlewares/
│   ├── errorHandler.js             # Manejo de errores
│   └── loginHandler.js             # Autenticación y autorización
│
├── views/                          # Plantillas Pug
│   ├── turnos.pug
│   ├── pacientes.pug
│   ├── profesionales.pug
│   ├── login.pug
│   └── layout.pug
│
└── public/
    └── js/                         # Scripts del cliente
        ├── login.js
        ├── pacientes.js
        └── profesionales.js
```

El proyecto sigue una estructura modular de tipo MVC, adaptada para una API REST con persistencia en MongoDB.
 
- **`index.js`**: punto de entrada de la aplicación. Configura Express, las sesiones, las vistas y monta las rutas de API y de vistas.
- **`models/`**: define los esquemas de Mongoose de cada entidad del sistema.
- **`controllers/`**: concentra la lógica de negocio de cada entidad, la autenticación, las vistas `mostrarVistaPacientes` y `mostrarVistaProfesionales`, y la validación de las reglas propias del dominio.
- **`routes/`**: define los endpoints REST y las rutas de autenticación, y delega la ejecución en su controller correspondiente.
- **`middlewares/`**: contiene los middlewares de autenticación, autorización y manejo de errores.
- **`views/`**: contiene las plantillas Pug utilizadas para el login y la gestión de turnos, pacientes y profesionales.
- **`public/`**: contiene los scripts del cliente para el login y las tablas dinámicas.