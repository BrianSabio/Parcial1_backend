# CIKIRE - API de Gestión de Turnos

API REST desarrollada con Node.js y Express para digitalizar el proceso de reservas de turnos de CIKIRE, un centro de atención que ofrece sesiones individuales y paquetes de sesiones con distintos profesionales.

## Equipo

Proyecto desarrollado de forma colaborativa por:

- Berzuini, Flavia Paola
- Bustamante, Pedro Matías
- Quiroz, Ludmila Mayra
- Sabio, Brian Ezequiel

## ¿Qué resuelve?

Actualmente las reservas se manejan de forma informal (planillas, WhatsApp), lo que genera turnos duplicados, errores de horario y dificultad para cancelar o consultar reservas. Este sistema digitaliza el proceso de gestión de reservas: recepción de la solicitud, verificación de disponibilidad del profesional y asignación del turno. También incluye tablas dinámicas para la gestión de pacientes y profesionales.

## Tecnologías

- Node.js + Express
- Persistencia en MongoDB con Mongoose
- Pug como motor de plantillas
- Sesiones con express-session

## Arquitectura

El proyecto sigue una estructura MVC adaptada, con persistencia en MongoDB:

```
proyecto/
├── models/         # Clases POO simples (solo constructor)
├── controllers/     # Lógica de negocio y validaciones
├── routes/           # Endpoints Express, delegan en los controllers
├── middlewares/      # Middlewares de autenticación y manejo de errores
├── views/            # Plantillas Pug
└── public/           # Scripts del cliente
```

**Regla de diseño**: los models definen los esquemas de datos. La persistencia y las reglas de negocio viven en los controllers.

## Entidades

- **Pacientes**: datos personales de quien solicita atención.
- **Profesionales**: quienes brindan las sesiones.
- **Disponibilidad**: bloques horarios de cada profesional.
- **Servicios**: sesión individual o paquete de sesiones contratado por un paciente.
- **Turnos**: reserva concreta que vincula paciente, profesional, servicio, fecha y hora.

## Reglas de negocio principales

- Un profesional no puede tener dos turnos en el mismo horario.
- Solo se pueden reservar horarios marcados como disponibles.
- Un turno puede estar en estado `reservado`, `cancelado` o `atendido`.
- Cancelar un turno libera la disponibilidad y devuelve la sesión consumida del paquete.
- Un servicio de tipo paquete no permite reservar turnos si ya no tiene sesiones disponibles.

## Identificadores

Los ids son generados y administrados por MongoDB mediante ObjectId, incluidas las relaciones (`pacienteId`, `profesionalId`, `servicioId`).

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm run dev    # con nodemon, reinicio automático
npm start       # sin nodemon
```

El servidor levanta por defecto en el puerto `3000`.

## Endpoints principales

| Entidad | Endpoints |
|---|---|
| Pacientes | `GET /api/pacientes`, `GET /api/pacientes/:id`, `POST /api/pacientes`, `PUT /api/pacientes/:id`, `DELETE /api/pacientes/:id` |
| Profesionales | `GET /api/profesionales`, `GET /api/profesionales/:id`, `POST /api/profesionales`, `PUT /api/profesionales/:id`, `DELETE /api/profesionales/:id` |
| Disponibilidad | `GET /api/disponibilidad`, `GET /api/disponibilidad/:id`, `POST /api/disponibilidad`, `PUT /api/disponibilidad/:id`, `DELETE /api/disponibilidad/:id` |
| Servicios | `GET /api/servicios`, `GET /api/servicios/:id`, `POST /api/servicios`, `PUT /api/servicios/:id`, `DELETE /api/servicios/:id`, `GET /api/servicios/estado/:pacienteId` (consulta: sesiones totales/consumidas/restantes de un paciente) |
| Turnos | `GET /api/turnos`, `GET /api/turnos/:id`, `POST /api/turnos`, `PUT /api/turnos/:id`, `PATCH /api/turnos/:id/cancelar`, `PATCH /api/turnos/:id/atender`, `DELETE /api/turnos/:id`, `GET /api/turnos/paciente/:pacienteId` (consulta: turnos de un paciente), `GET /api/turnos/profesional/:profesionalId` (consulta: agenda de un profesional) |
| Vista | `GET /vista/turnos`, `GET /vista/pacientes`, `GET /vista/profesionales` (vistas Pug de turnos, pacientes y profesionales) |

## Vista Pug

`views/layout.pug` define la base común de la página (usa herencia de plantillas con `extends`/`block content`). `views/turnos.pug`, `views/pacientes.pug` y `views/profesionales.pug` extienden ese layout y muestran las tablas correspondientes.

## Pruebas

Los endpoints se probaron con Postman. La documentación de cada request (endpoint, método, parámetros, body, respuesta esperada y respuesta ante error) se encuentra en el documento de entrega del proyecto.

## DOCS

En la raíz de carpetas del sistema se encuentra una llamada "docs", en donde se presentan documentos y diagramas del proyecto.

## Alcance

No incluye autenticación avanzada ni integración con servicios externos. Esta entrega se limita a API REST + persistencia en MongoDB + vistas Pug + lógica de negocio + validaciones + manejo de errores + consultas, según lo definido en la consigna.
