class Disponibilidad {
  constructor(id, profesionalId, fecha, horaInicio, horaFin, disponible = true) {
    this.id = id;
    this.profesionalId = profesionalId; 
    this.fecha = fecha;         
    this.horaInicio = horaInicio;       
    this.horaFin = horaFin;             
    this.disponible = disponible;               
  }
}

module.exports = Disponibilidad;