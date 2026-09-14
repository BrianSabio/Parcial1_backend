# CIKIRE | API de Gestión de Turnos

API REST desarrollada con Node.js y Express para digitalizar el proceso de reservas de turnos de CIKIRE, un centro de atención que ofrece sesiones individuales y paquetes de sesiones con distintos profesionales.

## ¿Qué resuelve?

Actualmente las reservas se manejan de forma informal (planillas, WhatsApp), lo que genera turnos duplicados, errores de horario y dificultad para cancelar o consultar reservas. Este sistema digitaliza el proceso de gestión de reservas: recepción de la solicitud, verificación de disponibilidad del profesional y asignación del turno.

## Tecnologías

- Node.js + Express
- Persistencia en archivos JSON (sin base de datos y sin ORM por ahora)
- Pug como motor de plantillas
- Programación Orientada a Objetos (POO)

## Arquitectura

El proyecto sigue una estructura MVC adaptada, con persistencia **síncrona** en JSON:

```
proyecto/
├── models/         # Clases POO simples (solo constructor)
├── controllers/     # Lógica de negocio + lectura/escritura de los JSON
├── routes/           # Endpoints Express, delegan en los controllers
├── middlewares/      # Middleware propio (manejo de errores)
├── views/            # Plantillas Pug
└── data/             # Archivos JSON (persistencia)
```

**Regla de diseño**: los models no saben persistirse a sí mismos. Toda la lectura/escritura de archivos y las reglas de negocio viven en los controllers. Cuando una entidad necesita datos de otra (por ejemplo, Turnos necesita a Disponibilidad y a Servicios), el controller importa funciones puntuales del otro controller.

## Entidades

- **Pacientes**: datos personales de quien solicita atención.
- **Profesionales**: quienes brindan las sesiones.
- **Disponibilidad**: bloques horarios de cada profesional.
- **Servicios**: sesión individual o paquete de sesiones contratado por un paciente.
- **Turnos**: reserva concreta que vincula paciente, profesional, servicio, fecha y hora.

## Reglas de negocio principales

- Un profesional no puede tener dos turnos en el mismo horario.
- Un paciente no puede reservar dos turnos iguales.
- Solo se pueden reservar horarios marcados como disponibles.
- Un turno puede estar en estado `reservado`, `cancelado` o `atendido`.
- Cancelar un turno libera la disponibilidad y, si corresponde, devuelve la sesión consumida del paquete.
- Un servicio de tipo paquete no permite reservar turnos si ya no tiene sesiones disponibles.

## Identificadores

Todos los ids se generan con `crypto.randomUUID()` (nativo de Node) y son de tipo `string` en todas las entidades, incluidas las relaciones (`pacienteId`, `profesionalId`, `servicioId`).

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
| Pacientes | `GET /pacientes`, `GET /pacientes/:id`, `POST /pacientes`, `PUT /pacientes/:id`, `DELETE /pacientes/:id` |
| Profesionales | `GET /profesionales`, `GET /profesionales/:id`, `POST /profesionales`, `PUT /profesionales/:id`, `DELETE /profesionales/:id` |
| Disponibilidad | `GET /disponibilidad`, `GET /disponibilidad?profesionalId=&fecha=`, `GET /disponibilidad/:id`, `POST /disponibilidad`, `PUT /disponibilidad/:id`, `DELETE /disponibilidad/:id` |
| Servicios | `GET /servicios`, `GET /servicios?pacienteId=`, `GET /servicios/:id`, `POST /servicios`, `PUT /servicios/:id`, `DELETE /servicios/:id` |
| Turnos | `GET /turnos`, `GET /turnos?profesionalId=&fecha=`, `GET /turnos?pacienteId=`, `GET /turnos/:id`, `POST /turnos`, `PUT /turnos/:id`, `PATCH /turnos/:id/cancelar`, `PATCH /turnos/:id/atender`, `DELETE /turnos/:id` |
| Vista | `GET /vista/turnos` (renderiza el listado de turnos con Pug) |

## DOCS
En la raíz de carpetas del sistema se encuentra una llamada "docs" en donde se presentan documentos y diagramas del proyecto.

## Alcance

No incluye interfaz gráfica completa, autenticación avanzada, integración con servicios externos ni base de datos MongoDB. Esta entrega se limita a API REST + persistencia en JSON + lógica de negocio + validaciones + manejo de errores + consultas, según lo definido en la consigna.
