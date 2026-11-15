# Documento técnico de estado

## 1. Propósito y alcance

Este documento describe el estado verificable de TurnoFlex, la solución
desarrollada para la clínica CIKIRE, luego de la
tercera entrega. Se elaboró mediante revisión del código vigente, los modelos,
las rutas, los controladores, las vistas, los scripts del cliente, la
configuración y la documentación del repositorio.

El documento distingue entre:

- **Implementado:** comportamiento presente en el código actual.
- **Declarado para la entrega:** contexto funcional o de despliegue informado
  por el equipo, que puede depender de configuración externa.
- **Limitación/deuda:** comportamiento incompleto, deliberadamente acotado o
  que requiere trabajo adicional.

El sistema debe considerarse un **MVP académico funcional**, no una plataforma
clínica lista para producción. La principal brecha pendiente es reforzar la
autorización a nivel de recurso, además de la validación, la consistencia
transaccional y la seguridad del frontend.

## 2. Contexto del producto

TurnoFlex representa la solución de gestión para CIKIRE, un centro integral de
kinesiología y rehabilitación. El
objetivo es reemplazar la gestión informal de turnos mediante planillas,
mensajería y procesos manuales por una aplicación web centralizada.

El alcance funcional comprende:

- Registro y autenticación de usuarios.
- Gestión de pacientes y profesionales.
- Carga de disponibilidades horarias.
- Servicios individuales o paquetes de sesiones.
- Reserva, consulta, cancelación y atención de turnos.
- Gestión jerárquica de usuarios internos.
- Vistas web de operación.
- Asistente informativo público en tiempo real.
- Landing institucional.

Según la documentación de la entrega final, existe un despliegue en Render
con MongoDB Atlas. El repositorio no contiene la configuración de
infraestructura ni credenciales de ese entorno; por lo tanto, este documento
describe el software y no certifica la disponibilidad del despliegue.

## 3. Estado general

| Área | Estado | Observación |
|---|---|---|
| Servidor HTTP | Implementado | Express sobre servidor HTTP nativo |
| API REST | Implementada | Recursos de pacientes, profesionales, disponibilidad, servicios, turnos y usuarios |
| Persistencia | Implementada | MongoDB mediante Mongoose |
| Vistas | Implementadas | Pug con Fetch en el navegador |
| Autenticación | Implementada | JWT firmado en cookie `HttpOnly` |
| Contraseñas | Implementadas | `bcrypt`, con migración oportunista de valores heredados |
| Autorización | Parcialmente implementada | Roles por endpoint; cobertura de pertenencia del recurso incompleta |
| Chat | Implementado | Socket.IO y Groq, con límites por conexión |
| Contacto | Simulado | El formulario no envía datos al backend |
| Tests automatizados | No implementados | Sólo validación manual documentada |
| CI/CD e infraestructura | Externa al repositorio | Se informa Render/MongoDB Atlas para la entrega |

La sintaxis de los 35 archivos JavaScript versionados fue validada con
`node --check`. `package.json` sólo define los scripts `start` y `dev`; no
define test, lint, build ni pipeline CI.

## 4. Arquitectura técnica

### 4.1 Tipo de aplicación

La solución es un monolito modular con tres superficies:

1. **API REST:** endpoints `/api/*` consumidos por Fetch.
2. **Vistas server-side:** páginas Pug en `/` y `/vista/*`.
3. **Canal en tiempo real:** Socket.IO para el asistente conversacional.

### 4.2 Flujo de arranque

[`index.js`](../index.js) realiza las siguientes tareas:

1. Carga `.env` con `dotenv`.
2. Inicia la conexión a MongoDB.
3. Crea la aplicación Express y un servidor HTTP.
4. Inicializa Socket.IO.
5. Configura Pug y el directorio `public`.
6. Agrega parsers JSON y URL-encoded, `cookie-parser` y carga opcional de usuario.
7. Monta rutas de login, API y vistas.
8. Registra el handler de errores.
9. Escucha en `PORT` o en el puerto 3000.

La conexión a MongoDB se inicia antes de `listen`, pero no se espera
explícitamente su resolución antes de comenzar a aceptar tráfico.

### 4.3 Patrón arquitectónico

El repositorio aplica un MVC liviano:

- `models/`: esquemas y modelos Mongoose.
- `controllers/`: acceso a datos y reglas de negocio.
- `routes/`: endpoints y middlewares de acceso.
- `middlewares/`: autenticación, autorización y errores.
- `views/`: plantillas Pug.
- `public/js/`: interacción del navegador.
- `config/`: MongoDB, Socket.IO y cliente Groq.
- `utils/`: utilidades JWT.
- `sockets/`: eventos del chat.

No existe una capa de servicios de dominio, repositorios, validadores
centralizados ni migraciones.

## 5. Funcionalidades implementadas

### Autenticación y usuarios

- Login con usuario y contraseña.
- Sólo usuarios con estado `activo` pueden autenticarse.
- Comparación con `bcrypt`.
- Compatibilidad temporal con contraseñas heredadas en texto plano y
  actualización a hash luego del primer login válido.
- Emisión de JWT firmado en cookie `HttpOnly`.
- Logout mediante eliminación de la cookie.
- Registro público, que crea usuarios con rol `paciente`.
- Alta y cambio de estado de usuarios internos desde `/api/usuarios`, con
  jerarquía `director` → `coordinador` → personal operativo.

### Agenda y dominio clínico

- CRUD de pacientes.
- CRUD de profesionales, incluyendo `estado` activo/inactivo.
- CRUD de disponibilidades.
- Detección de solapamiento al crear disponibilidades.
- CRUD de servicios y saldo de sesiones.
- Reserva condicionada por servicio, saldo, disponibilidad y horario ocupado.
- Cancelación de turnos reservados con devolución de una sesión.
- Marcado de turnos reservados como atendidos.
- Consultas de turnos por paciente y agenda por profesional.

### Interfaz

- Landing institucional.
- Login y registro.
- Gestión de turnos.
- Gestión de pacientes.
- Gestión de profesionales.
- Gestión de usuarios internos.
- Chat visible en la landing y en las vistas públicas/de paciente.

### Chat

[`sockets/chatSocket.js`](../sockets/chatSocket.js) implementa:

- Mensaje de bienvenida.
- Historial independiente por conexión, que se elimina al desconectarse.
- Conservación de hasta 10 intercambios conversacionales, equivalentes a un
  máximo de 20 mensajes de usuario/asistente.
- Mensajes de hasta 1000 caracteres.
- Límite de 8 consultas por minuto por socket.
- Respuestas en español con contexto institucional.
- Guardrails en el prompt para limitar el asistente a información
  institucional y evitar diagnósticos o indicaciones médicas.
- Integración con Groq mediante el cliente OpenAI-compatible de OpenAI, usando
  `https://api.groq.com/openai/v1` como `baseURL` y el modelo
  `openai/gpt-oss-20b`.

La conexión Socket.IO es pública y no requiere autenticación. Las respuestas
se envían con `socket.emit` al socket que realizó la consulta y el historial
no se comparte con otras conexiones; esto aísla las conversaciones por
conexión, pero no constituye autenticación ni una garantía de privacidad de
identidad. El límite es local al proceso y a cada conexión; no constituye un
rate limit distribuido.

## 6. Modelo de datos vigente

Las entidades y referencias se describen en
[`docs/modelo_datos.md`](modelo_datos.md). Todas las colecciones utilizan
timestamps de Mongoose.

### Usuario

Campos: `usuario` único, `password`, `nombre`, `apellido`, `rol`, `estado`,
`pacienteRef` y `profesionalRef`. El rol es un enum de seis valores:
`paciente`, `recepcionista`, `profesional`, `administrativo`, `coordinador` y
`director`.

### Paciente

Campos obligatorios: `nombre`, `apellido`, `dni`. El DNI es único. Teléfono y
email son opcionales.

### Profesional

Campos obligatorios: `nombre`, `apellido`, `especialidad`. Matrícula,
teléfono, email y `estado` son complementarios. El estado admite `activo` e
`inactivo`.

### Disponibilidad

Referencia a profesional, `fecha`, `horaInicio`, `horaFin` y `disponible`.
Fecha y horas se almacenan como strings; el modelo no impone formato ni orden
temporal.

### Servicio

Referencia a paciente, `tipo`, `sesionesTotales` y `sesionesConsumidas`.
`sesionesTotales` tiene mínimo 1 y `sesionesConsumidas` mínimo 0.

### Turno

Referencias a paciente, profesional y servicio; `fecha`, `hora` y `estado`.
El estado admite `reservado`, `confirmado`, `cancelado` y `atendido`. En el
flujo actual se crean turnos reservados, se cancelan o se marcan atendidos;
no hay endpoint específico para confirmar.

## 7. Autenticación y autorización

### Autenticación

[`utils/jwt.js`](../utils/jwt.js) genera tokens con `sub`, rol y referencias
de paciente/profesional. El secreto se toma de `JWT_SECRET` y la expiración de
`JWT_EXPIRES_IN`, con valor predeterminado de una hora.

La cookie se configura con:

- `httpOnly: true`
- `sameSite: 'lax'`
- `secure: true` sólo cuando `NODE_ENV=production`
- `maxAge` fijo de una hora

### Autorización

[`middlewares/loginHandler.js`](../middlewares/loginHandler.js) separa:

- `cargarUsuarioOpcional`: carga el usuario para vistas públicas.
- `esAutenticado`: rechaza requests sin token válido.
- `permitirRoles`: valida roles permitidos por ruta.

Las APIs responden JSON 401/403 y las vistas redirigen a `/login`.

### Limitaciones conocidas

- El middleware confía en los claims del JWT y no vuelve a consultar el
  usuario en cada request. Desactivar un usuario o cambiar su rol no invalida
  tokens existentes hasta que expiren.
- La autorización se aplica principalmente a nivel de endpoint. Algunos
  controladores no verifican que el usuario sea propietario del paciente,
  servicio o turno solicitado.
- No existe protección CSRF específica para operaciones autenticadas por cookie.
- Socket.IO acepta conexiones públicas y configura CORS con `origin: '*'`.
- No hay headers de seguridad, rate limit HTTP global ni auditoría.
- El frontend construye HTML con `innerHTML` a partir de datos externos en
  varios scripts, lo que requiere corrección para reducir riesgo XSS.
- La migración de texto plano es compatibilidad heredada; no debe mantenerse
  como estrategia permanente.

## 8. Endpoints vigentes

### Autenticación

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| GET | `/login` | Público | Formulario de login |
| POST | `/login` | Público | Autenticar y emitir cookie |
| GET | `/login/registro` | Público | Formulario de registro |
| POST | `/login/registro` | Público o administrativo | Crear usuario; rol paciente por defecto |
| GET | `/login/logout` | Público | Eliminar cookie y redirigir |

### Pacientes

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/pacientes` | administrativo, coordinador, recepcionista, profesional, director |
| GET | `/api/pacientes/:id` | administrativo, coordinador, recepcionista, profesional, director |
| POST | `/api/pacientes` | administrativo, coordinador, recepcionista |
| PUT | `/api/pacientes/:id` | administrativo, coordinador, recepcionista |
| DELETE | `/api/pacientes/:id` | administrativo, coordinador, recepcionista |

### Profesionales

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/profesionales` | todos los roles |
| GET | `/api/profesionales/:id` | todos los roles |
| POST | `/api/profesionales` | administrativo, coordinador, director |
| PUT | `/api/profesionales/:id` | administrativo, coordinador, director |
| DELETE | `/api/profesionales/:id` | administrativo, coordinador |

La activación/desactivación se realiza mediante `PUT` sobre el profesional;
no existe `PATCH /:id/estado`.

### Disponibilidades

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/disponibilidad` | paciente, profesional, administrativo |
| GET | `/api/disponibilidad/:id` | paciente, profesional, administrativo |
| POST | `/api/disponibilidad` | administrativo, profesional |
| PUT | `/api/disponibilidad/:id` | administrativo, profesional |
| DELETE | `/api/disponibilidad/:id` | administrativo, profesional |

### Servicios

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/servicios` | todos los roles |
| GET | `/api/servicios/:id` | todos los roles |
| GET | `/api/servicios/estado/:pacienteId` | paciente, recepcionista, administrativo, coordinador, director |
| POST | `/api/servicios` | paciente, recepcionista, administrativo, coordinador |
| PUT | `/api/servicios/:id` | recepcionista, administrativo, coordinador |
| DELETE | `/api/servicios/:id` | recepcionista, administrativo, coordinador |

### Turnos

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/turnos` | todos los roles |
| GET | `/api/turnos/:id` | todos los roles |
| GET | `/api/turnos/paciente/:pacienteId` | todos los roles |
| GET | `/api/turnos/profesional/:profesionalId` | todos los roles |
| POST | `/api/turnos` | paciente, recepcionista, administrativo, coordinador |
| PUT | `/api/turnos/:id` | paciente, recepcionista, administrativo, coordinador |
| PATCH | `/api/turnos/:id/cancelar` | paciente, recepcionista, administrativo, coordinador |
| PATCH | `/api/turnos/:id/atender` | profesional |
| DELETE | `/api/turnos/:id` | recepcionista, administrativo, coordinador |

### Usuarios internos

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/usuarios` | director, coordinador |
| POST | `/api/usuarios` | director, coordinador |
| PATCH | `/api/usuarios/:id/estado` | director, coordinador |

### Vistas

`/`, `/vista/turnos`, `/vista/pacientes`, `/vista/profesionales` y
`/vista/usuarios`.

## 9. Reglas de negocio actuales

1. Sólo usuarios activos pueden iniciar sesión.
2. Los pacientes pueden reservar usando el paciente asociado al token.
3. El servicio utilizado para reservar debe pertenecer al paciente.
4. No se reserva si el saldo de sesiones está agotado.
5. La disponibilidad debe cubrir la fecha y hora solicitadas.
6. No se permite otro turno no cancelado para el mismo profesional, fecha y hora.
7. Cancelar un turno reservado decrementa `sesionesConsumidas`.
8. Sólo un turno reservado puede cancelarse o marcarse como atendido.
9. La creación de disponibilidades rechaza rangos superpuestos existentes.
10. La jerarquía de usuarios limita los roles internos que se pueden crear o
    modificar.

## 10. Consistencia y riesgos funcionales

### Riesgos altos

- Cancelación, actualización y atención de turnos no verifican siempre la
  pertenencia del recurso al usuario autenticado.
- Las consultas por paciente/profesional reciben un ID externo y no siempre
  aplican restricción por rol.
- La creación de servicios permite que un paciente envíe un `pacienteId`
  distinto del propio.
- Reserva y consumo de sesiones se ejecutan sin transacción ni operación
  atómica; dos solicitudes concurrentes pueden producir inconsistencias.

### Riesgos medios

- `PUT` de varios recursos acepta `req.body` completo, permitiendo modificar
  campos que deberían ser inmutables o restringidos.
- Fechas y horas son strings libres y no hay validación centralizada.
- No se valida de forma uniforme que las referencias relacionadas existan o
  que el profesional esté activo.
- El contador de sesiones y los turnos no tienen índices de integridad
  suficientes.

### Deuda funcional

- El cobro de consultas particulares sólo se registra en un `Set` del
  navegador y se pierde al recargar.
- El formulario de contacto sólo muestra una confirmación local.
- No hay health check, métricas, logs estructurados, backups ni migraciones.
- No hay suite automatizada de pruebas.

## 11. Configuración y despliegue

Variables esperadas en `.env`:

| Variable | Uso |
|---|---|
| `MONGODB_URI` | URI de MongoDB local o Atlas |
| `PORT` | Puerto HTTP; default 3000 |
| `JWT_SECRET` | Secreto de firma JWT |
| `JWT_EXPIRES_IN` | Duración del token; default `1h` |
| `NODE_ENV` | Habilita cookie segura en producción |
| `GROQ_API_KEY` | Credencial de Groq |

`.env` está excluido de Git; sólo se versiona `.env.example`. `GROQ_API_KEY`
se valida durante la carga de `config/groq.js`, por lo que su ausencia impide
el arranque.

Comandos disponibles:

```bash
npm install
npm run dev
npm start
```

El despliegue Render/MongoDB Atlas informado en la entrega requiere configurar
las variables anteriores en el proveedor. No deben incluirse secretos en el
repositorio ni en esta documentación.

## 12. Pruebas y verificaciones

El proyecto documenta pruebas manuales con Postman sobre el entorno local y el
despliegue de la entrega. Los escenarios principales incluyen login correcto e
incorrecto, rechazo sin JWT, CRUD de pacientes, DNI duplicado, reserva,
conflicto horario, cancelación y registro público.

En el repositorio no hay pruebas automatizadas. La revisión técnica actual
validó la sintaxis de los archivos JavaScript con `node --check`, pero esa
verificación no reemplaza pruebas de integración, autorización, concurrencia
ni seguridad.

## 13. Evolución del sistema

### De persistencia JSON a MongoDB

La primera versión utilizaba clases y archivos JSON. La segunda etapa migró a
Mongoose/MongoDB, incorporó esquemas, referencias ObjectId y operaciones
asíncronas.

### De sesiones a JWT

La versión final sustituyó `express-session` por JWT en cookie `HttpOnly`,
agregó bcrypt y adaptó las rutas de API y vistas al nuevo middleware.

### Incorporación del asistente

Pedro incorporó la infraestructura Socket.IO y la comunicación en tiempo real.
Flavia participó en la integración del asistente institucional, su migración
de Gemini a Groq, la definición del comportamiento del prompt y el desarrollo
de la landing page.

### Distribución declarada de responsabilidades

La siguiente distribución corresponde a las responsabilidades declaradas por
el equipo para la entrega final. Se describen sólo actividades relacionadas
con componentes presentes en el repositorio:

- **Berzuini, Flavia:** diseño de la matriz RBAC y aplicación de permisos en
  vistas y rutas; gestión de usuarios internos y estado de profesionales;
  reglas de negocio para turnos, servicios y disponibilidades; integración
  funcional del asistente con Groq, incluyendo el prompt institucional, sus
  validaciones y el límite por conexión; desarrollo de vistas Pug, calendario,
  búsquedas y cargas en cascada del frontend; landing page; y configuración
  del despliegue, las variables de entorno y la persistencia.
- **Bustamante, Pedro:** infraestructura de comunicación en tiempo real,
  lógica del chat y redacción de documentación técnica.
- **Quiroz, Ludmila:** adaptación de controladores a Mongoose, filtrado de
  información según el rol y esquema/lógica de usuarios internos.
- **Sabio Barros, Brian:** autenticación JWT en cookie `HttpOnly`, hash de
  contraseñas con bcrypt, utilidades JWT, middlewares de autenticación y
  autorización, y actualización del README.

## 14. Plan técnico recomendado

### Prioridad 1 — seguridad e integridad

1. Centralizar autorización por recurso para paciente, profesional, servicio y
   turno.
2. Restringir campos mutables y definir transiciones explícitas de turno.
3. Usar transacciones MongoDB e índices para reserva y saldo.
4. Validar formato, rango y coherencia de fechas, horas y referencias.
5. Reemplazar `innerHTML` con renderizado seguro y agregar CSP/headers.

### Prioridad 2 — operación

6. Revalidar estado/rol del usuario o implementar revocación de tokens.
7. Agregar CSRF, CORS restringido y rate limiting HTTP.
8. Homogeneizar errores y agregar handler 404, logging estructurado y
   correlación de requests.
9. Incorporar tests de autorización, reglas de reserva y concurrencia.

### Prioridad 3 — evolución

10. Persistir cobros y auditoría.
11. Implementar el contacto real o eliminar la promesa de envío.
12. Agregar health/readiness checks, métricas, backups y CI.
13. Separar servicios de dominio y repositorios cuando el alcance crezca.

## 15. Conclusión

TurnoFlex alcanzó una implementación funcional que integra API REST,
persistencia MongoDB, vistas Pug, autenticación JWT, control de roles y
comunicación Socket.IO para CIKIRE. La evolución desde archivos JSON hasta la
versión desplegable demuestra un progreso técnico significativo para la entrega
de la materia.

El sistema está correctamente presentado como prototipo académico, siempre que
se expliciten sus límites. Para un entorno real con información de pacientes
deben resolverse primero la autorización por recurso, las condiciones de
carrera, la validación centralizada y la protección XSS/CSRF.
