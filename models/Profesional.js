const fs = require('fs');
const path = require('path');

// Ruta al archivo de persistencia
const dataPath = path.join(__dirname, '../data/profesionales.json');

class Profesional {
    constructor(id, nombre, apellido, especialidad) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.especialidad = especialidad;
    }

    // --- MÉTODOS DE PERSISTENCIA ---

    static leerDatos() {
        try {
            const data = fs.readFileSync(dataPath, 'utf-8');
            const registros = JSON.parse(data);
            return registros.map(p => new Profesional(p.id, p.nombre, p.apellido, p.especialidad));
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
        const profesionales = this.leerDatos();
        return profesionales.find(p => p.id === String(id));
    }

    static crear(datos) {
        const profesionales = this.leerDatos();

        const nuevoId = Date.now().toString();

        const nuevoProfesional = new Profesional(
            nuevoId,
            datos.nombre,
            datos.apellido,
            datos.especialidad
        );

        profesionales.push(nuevoProfesional);
        this.guardarDatos(profesionales);

        return nuevoProfesional;
    }

    static actualizar(id, datosActualizados) {
        const profesionales = this.leerDatos();
        const indice = profesionales.findIndex(p => p.id === String(id));

        if (indice === -1) {
            return null;
        }

        const actual = profesionales[indice];
        const actualizado = new Profesional(
            actual.id,
            datosActualizados.nombre ?? actual.nombre,
            datosActualizados.apellido ?? actual.apellido,
            datosActualizados.especialidad ?? actual.especialidad
        );

        profesionales[indice] = actualizado;
        this.guardarDatos(profesionales);

        return actualizado;
    }

    static eliminar(id) {
        const profesionales = this.leerDatos();
        const profesionalesFiltrados = profesionales.filter(p => p.id !== String(id));

        if (profesionales.length !== profesionalesFiltrados.length) {
            this.guardarDatos(profesionalesFiltrados);
            return true;
        }
        return false;
    }
}

module.exports = Profesional;