class Disponibilidad {
    constructor(id, profesionalId, diaSemana, horaInicio, horaFin, activo = true) {
      this.id = id;
      this.profesionalId = profesionalId; 
      this.diaSemana = diaSemana;         
      this.horaInicio = horaInicio;       
      this.horaFin = horaFin;             
      this.activo = activo;               
    }
  
    estaEnRango(horaConsulta) {
      return horaConsulta >= this.horaInicio && horaConsulta < this.horaFin;
    }
  }
  
  module.exports = Disponibilidad;