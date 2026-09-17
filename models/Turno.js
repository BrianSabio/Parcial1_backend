class Turno {
    constructor(id, pacienteId, profesionalId, servicioId, fecha, hora, estado = 'reservado') {
      this.id = id;
      this.pacienteId = pacienteId;
      this.profesionalId = profesionalId;
      this.servicioId = servicioId;
      this.fecha = fecha;
      this.hora = hora;
      this.estado = estado;
    }
  }
  
  module.exports = Turno;