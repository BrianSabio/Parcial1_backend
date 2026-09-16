const fs = require('fs');
const path = require('path');
const turnosFilePath = path.join(__dirname, '../data/turnos.json');

// Función para leer los turnos del archivo JSON
const leerTurnos = () => {
    try {
        const data = fs.readFileSync(turnosFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe o está vacío, devolvemos un array vacío
        return [];
    }
};

// Función para guardar los turnos en el archivo JSON
const guardarTurnos = (turnos) => {
    fs.writeFileSync(turnosFilePath, JSON.stringify(turnos, null, 2));
};

// GET: Obtener todos los turnos
const obtenerTurnos = (req, res) => {
    try {
        const turnos = leerTurnos();
        res.status(200).json(turnos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los turnos', error: error.message });
    }
};

// POST: Crear un nuevo turno
const crearTurno = (req, res) => {
    try {
        // 1. Recibimos los datos del body
        const { pacienteId, profesionalId, fecha, hora, tipoServicio } = req.body;

        // 2. Validamos que no falten datos clave
        if (!pacienteId || !profesionalId || !fecha || !hora) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios (paciente, profesional, fecha, hora)" });
        }

        const turnos = leerTurnos();

        // 3. Regla de negocio: validar que el profesional no tenga otro turno activo en ese horario
        const turnoOcupado = turnos.find(
            (t) => t.profesionalId === profesionalId && 
                   t.fecha === fecha && 
                   t.hora === hora && 
                   t.estado !== "cancelado"
        );

        if (turnoOcupado) {
            return res.status(409).json({ mensaje: "Error: El profesional ya tiene un turno reservado en ese horario" });
        }

        // 4. Armamos el objeto del nuevo turno
        const nuevoTurno = {
            id: Date.now().toString(), // Generamos un ID único basado en la fecha exacta
            pacienteId,
            profesionalId,
            fecha,
            hora,
            tipoServicio: tipoServicio || "Consulta General",
            estado: "reservado" // Estados posibles: reservado, atendido, cancelado
        };

        // 5. Lo agregamos a la lista y guardamos en el JSON
        turnos.push(nuevoTurno);
        guardarTurnos(turnos);

        // 6. Respondemos con éxito (Código 201: Creado)
        res.status(201).json({ mensaje: "Turno creado con éxito", turno: nuevoTurno });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear el turno", error: error.message });
    }
};

// PATCH: Cancelar un turno (Cambiar estado a "cancelado")
const cancelarTurno = (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el ID desde la URL
        const turnos = leerTurnos();

        // Buscamos la posición del turno en nuestra lista
        const index = turnos.findIndex(t => t.id === id);

        if (index === -1) {
            return res.status(404).json({ mensaje: "Error: Turno no encontrado" });
        }

        // Regla de negocio: No se puede cancelar un turno ya cancelado o ya atendido
        if (turnos[index].estado !== "reservado") {
            return res.status(400).json({ 
                mensaje: `El turno no se puede cancelar porque ya está ${turnos[index].estado}` 
            });
        }

        // Cambiamos el estado
        turnos[index].estado = "cancelado";
        
        // Guardamos los cambios en el JSON
        guardarTurnos(turnos);

        res.status(200).json({ mensaje: "Turno cancelado correctamente", turno: turnos[index] });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al cancelar el turno", error: error.message });
    }
};

// PATCH: Marcar un turno como atendido
const atenderTurno = (req, res) => {
    try {
        const { id } = req.params;
        const turnos = leerTurnos();

        const index = turnos.findIndex(t => t.id === id);

        if (index === -1) {
            return res.status(404).json({ mensaje: "Error: Turno no encontrado" });
        }

        // Regla de negocio: Solo podemos atender turnos que estén reservados
        if (turnos[index].estado !== "reservado") {
            return res.status(400).json({ 
                mensaje: `El turno no se puede atender porque ya está ${turnos[index].estado}` 
            });
        }

        // Cambiamos el estado
        turnos[index].estado = "atendido";
        
        // Guardamos
        guardarTurnos(turnos);

        res.status(200).json({ mensaje: "Turno marcado como atendido", turno: turnos[index] });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al atender el turno", error: error.message });
    }
};

// GET: Obtener un turno específico por ID
const obtenerTurnoPorId = (req, res) => {
    try {
        const { id } = req.params;
        const turnos = leerTurnos();
        const turno = turnos.find(t => t.id === id);

        if (!turno) {
            return res.status(404).json({ mensaje: "Error: Turno no encontrado" });
        }
        
        res.status(200).json(turno);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener el turno", error: error.message });
    }
};

// PUT: Actualizar los datos de un turno existente
const actualizarTurno = (req, res) => {
    try {
        const { id } = req.params;
        const { pacienteId, profesionalId, fecha, hora, tipoServicio } = req.body;
        
        const turnos = leerTurnos();
        const index = turnos.findIndex(t => t.id === id);

        if (index === -1) {
            return res.status(404).json({ mensaje: "Error: Turno no encontrado" });
        }

        // Actualizamos los datos pero protegemos el ID y el estado actual
        turnos[index] = {
            ...turnos[index], // Copia todo lo que ya tenía
            pacienteId: pacienteId || turnos[index].pacienteId,
            profesionalId: profesionalId || turnos[index].profesionalId,
            fecha: fecha || turnos[index].fecha,
            hora: hora || turnos[index].hora,
            tipoServicio: tipoServicio || turnos[index].tipoServicio
        };

        guardarTurnos(turnos);
        res.status(200).json({ mensaje: "Turno actualizado correctamente", turno: turnos[index] });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar el turno", error: error.message });
    }
};

// DELETE: Eliminar un turno de la base de datos (JSON)
const eliminarTurno = (req, res) => {
    try {
        const { id } = req.params;
        const turnos = leerTurnos();
        const index = turnos.findIndex(t => t.id === id);

        if (index === -1) {
            return res.status(404).json({ mensaje: "Error: Turno no encontrado" });
        }

        // Lo quitamos de la lista usando splice
        const turnoEliminado = turnos.splice(index, 1);
        guardarTurnos(turnos);

        res.status(200).json({ mensaje: "Turno eliminado permanentemente", turno: turnoEliminado[0] });

    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el turno", error: error.message });
    }
};

const mostrarVistaTurnos = (req, res) => { res.status(501).send("Vista Pug en construcción"); };

// Exportamos TODAS las funciones que piden las rutas
module.exports = {
    obtenerTurnos,
    obtenerTurnoPorId,
    crearTurno,
    actualizarTurno,
    cancelarTurno,
    atenderTurno,
    eliminarTurno,
    mostrarVistaTurnos
};

