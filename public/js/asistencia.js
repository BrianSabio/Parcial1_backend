// Inicializar la conexión cliente con Socket.io
const socket = io();

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatHistorial = document.getElementById('chatHistorial');

if (chatForm) {
  // 1. Enviar mensaje al servidor al hacer Submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mensaje = chatInput.value.trim();

    if (mensaje) {
      // Emitir evento con el texto ingresado
      socket.emit('chat:mensaje', {
        texto: mensaje,
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      chatInput.value = '';
    }

  });

  // 2. Escuchar mensajes provenientes del servidor y actualizarlos en el DOM
  socket.on('chat:mensaje', (data) => {
    const nuevoMensaje = document.createElement('div');
    nuevoMensaje.style.marginBottom = '6px';
    nuevoMensaje.innerHTML = `<strong>[${data.fecha}]</strong>: ${data.texto}`;
    
    chatHistorial.appendChild(nuevoMensaje);
    chatHistorial.scrollTop = chatHistorial.scrollHeight;
  });
}