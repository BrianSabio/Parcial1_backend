document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const mensajeError = document.querySelector('.alert-error');

    mensajeError.style.display = 'none'; 

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const usuario = document.getElementById('usuario').value;
        const password = document.getElementById('password').value;

        try {
            const respuesta = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, password })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                window.location.href = '/vista/turnos';
            } else {
                mensajeError.textContent = data.mensaje || 'Credenciales inválidas.';
                mensajeError.style.display = 'block'; 
            }

        } catch (error) {
            console.error('Error de red:', error);
            mensajeError.textContent = 'Error al conectar con el servidor.';
            mensajeError.style.display = 'block';
        }
    });
});