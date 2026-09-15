class Servicio {
    constructor(id, nombre, duracionMinutos, precio, profesionalIds = []) {
      this.id = id;
      this.nombre = nombre;                   
      this.duracionMinutos = duracionMinutos; 
      this.precio = precio;                   
      this.profesionalIds = profesionalIds;   
    }
  
    agregarProfesional(profesionalId) {
      if (!this.profesionalIds.includes(profesionalId)) {
        this.profesionalIds.push(profesionalId);
      }
    }
  }
  
  module.exports = Servicio;