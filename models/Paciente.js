class Paciente {
  constructor(id, nombre, apellido, dni, telefono, email) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.dni = dni;
    this.telefono = telefono;
    this.email = email;
  }
}

module.exports = Paciente;