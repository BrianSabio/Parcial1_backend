const fs = require('fs');
const path = require('path');

// Ruta al archivo de persistencia
const dataPath = path.join(__dirname, '../data/pacientes.json');

class Paciente {
    constructor(id, nombre, apellido, dni, telefono, email) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.telefono = telefono;
        this.email = email;
    }

    // --- MÉTODOS DE PERSISTENCIA ---

    static leerDatos() {
        try {
            const data = fs.readFileSync(dataPath, 'utf-8');
            const registros = JSON.parse(data);
            return registros.map(p => new Paciente(p.id, p.nombre, p.apellido, p.dni, p.telefono, p.email));
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    static guardarDatos(datos) {
        fs.mkdirSync(path.dirname(dataPath), { recursive: true });
        fs.writeFileSync(dataPath, JSON.stringify(datos, null, 2), 'utf-8');
    }

    // --- MÉTODOS DEL MODELO ---

    static obtenerTodos() {
        return this.leerDatos();
    }

    static obtenerPorId(id) {
        const pacientes = this.leerDatos();
        return pacientes.find(p => p.id === String(id));
    }

    static obtenerPorDni(dni) {
        const pacientes = this.leerDatos();
        return pacientes.find(p => p.dni === dni);
    }

    static crear(datos) {
        const pacientes = this.leerDatos();

        const nuevoId = Date.now().toString();

        const nuevoPaciente = new Paciente(
            nuevoId,
            datos.nombre,
            datos.apellido,
            datos.dni,
            datos.telefono,
            datos.email
        );

        pacientes.push(nuevoPaciente);
        this.guardarDatos(pacientes);

        return nuevoPaciente;
    }

    static actualizar(id, datosActualizados) {
        const pacientes = this.leerDatos();
        const indice = pacientes.findIndex(p => p.id === String(id));

        if (indice === -1) {
            return null;
        }

        const actual = pacientes[indice];
        const actualizado = new Paciente(
            actual.id,
            datosActualizados.nombre ?? actual.nombre,
            datosActualizados.apellido ?? actual.apellido,
            datosActualizados.dni ?? actual.dni,
            datosActualizados.telefono ?? actual.telefono,
            datosActualizados.email ?? actual.email
        );

        pacientes[indice] = actualizado;
        this.guardarDatos(pacientes);

        return actualizado;
    }

    static eliminar(id) {
        const pacientes = this.leerDatos();
        const pacientesFiltrados = pacientes.filter(p => p.id !== String(id));

        if (pacientes.length !== pacientesFiltrados.length) {
            this.guardarDatos(pacientesFiltrados);
            return true;
        }
        return false;
    }
}

module.exports = Paciente;