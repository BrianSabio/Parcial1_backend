const socket = io();

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatHistorial = document.getElementById('chatHistorial');

if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const mensaje = chatInput.value.trim();

    if (mensaje) {
      socket.emit('chat:mensaje', {
        texto: mensaje,
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      chatInput.value = '';
    }

  });

  socket.on('chat:mensaje', (data) => {
    const nuevoMensaje = document.createElement('div');
    nuevoMensaje.style.marginBottom = '6px';
    nuevoMensaje.innerHTML = `<strong>[${data.fecha}]</strong>: ${data.texto}`;
    
    chatHistorial.appendChild(nuevoMensaje);
    chatHistorial.scrollTop = chatHistorial.scrollHeight;
  });
}