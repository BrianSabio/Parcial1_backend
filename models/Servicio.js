class Servicio {
  constructor(id, pacienteId, tipo, sesionesTotales, sesionesConsumidas = 0) {
    this.id = id;
    this.pacienteId = pacienteId;                  
    this.tipo = tipo; 
    this.sesionesTotales = sesionesTotales;                  
    this.sesionesConsumidas = sesionesConsumidas;   
  }
}

module.exports = Servicio;