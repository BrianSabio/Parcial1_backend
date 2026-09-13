# Estructura de carpetas

MVC para API REST con persistencia en JSON utilizando PUG

Persistencia síncrona (`fs.readFileSync` / `fs.writeFileSync`).

```
Proyecto/
├── package.json                    # Configuración del proyecto y dependencias
├── index.js                        # Punto de entrada y servidor Express
│
├── models/                         # Clases POO
│   ├── Paciente.js
│   ├── Profesional.js
│   ├── Disponibilidad.js
│   ├── Servicio.js
│   └── Turno.js
│
├── controllers/                    # Lógica de negocio / manejo de req-res
│   ├── pacientesController.js
│   ├── profesionalesController.js
│   ├── disponibilidadController.js
│   ├── serviciosController.js
│   └── turnosController.js
│
├── routes/                         # Definición de rutas Express
│   ├── pacientesRoutes.js
│   ├── profesionalesRoutes.js
│   ├── disponibilidadRoutes.js
│   ├── serviciosRoutes.js
│   └── turnosRoutes.js
│
├── middlewares/
│   └── errorHandler.js             # Middleware propio (manejo de errores)
│
├── views/                          # Pug
│   ├── turnos.pug
│   └── layout.pug
│
└── data/                           # Persistencia en JSON
    ├── pacientes.json
    ├── profesionales.json
    ├── disponibilidad.json
    ├── servicios.json
    └── turnos.json
```

El proyecto sigue una estructura modular de tipo MVC, adaptada para una API REST con persistencia en archivos JSON.
 
- **`index.js`**: punto de entrada de la aplicación. Configura Express, habilita el parseo de JSON en las solicitudes y monta las rutas de cada entidad.
- **`models/`**: define las clases de cada entidad del sistema (Paciente, Profesional, Disponibilidad, Servicio, Turno), estableciendo la estructura de datos que maneja la aplicación.
- **`controllers/`**: concentra la lógica de negocio de cada entidad, incluyendo la lectura y escritura síncrona sobre los archivos JSON de `data/` y la validación de las reglas propias del dominio (por ejemplo, evitar la superposición de turnos).
- **`routes/`**: define los endpoints REST de cada entidad (GET, POST, PUT, DELETE) y delega la ejecución en su controller correspondiente.
- **`middlewares/`**: contiene el middleware propio del proyecto, en este caso `errorHandler.js`, encargado de centralizar el manejo de errores de la API.
- **`views/`**: contiene las plantillas Pug utilizadas para la visualización de turnos (listado y layout general).
- **`data/`**: almacena los archivos JSON que funcionan como base de datos persistente de cada entidad.