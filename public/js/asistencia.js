const socket = io();

const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatHistorial = document.getElementById('chatHistorial');

const chatToggle = document.getElementById('chatToggle');
const chatWidget = document.getElementById('chat-widget');
const closeChat = document.getElementById('closeChat');

if (chatToggle && chatWidget && closeChat) {
    chatToggle.addEventListener('click', () => {
        chatWidget.classList.remove('hidden');
        chatToggle.style.display = 'none';
    });

    closeChat.addEventListener('click', () => {
        chatWidget.classList.add('hidden');
        chatToggle.style.display = 'flex';
    });
}

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