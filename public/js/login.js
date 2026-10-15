document.addEventListener('DOMContentLoaded', () => {
    // 1. Capturamos los elementos de la vista
    const form = document.querySelector('form');
    const mensajeError = document.querySelector('.alert-error');

    // Ocultamos el mensaje de error por defecto al cargar la página
    mensajeError.style.display = 'none'; 

    // 2. Escuchamos el evento submit del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        // 3. Obtenemos los valores de los inputs
        const usuario = document.getElementById('usuario').value;
        const password = document.getElementById('password').value;

        try {
            // 4. Armamos la petición asíncrona con fetch()
            const respuesta = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Le decimos al back que mandamos JSON
                },
                body: JSON.stringify({ usuario, password }) // Convertimos los datos
            });

            // Esperamos la respuesta del backend parseada a JSON
            const data = await respuesta.json();

            // 5. Refresco dinámico del DOM según la respuesta
            if (respuesta.ok) {
                // Si salió bien (status 200), redirigimos nosotros manualmente
                window.location.href = '/vista/turnos'; // Ajustá esta ruta a donde deba ir
            } else {
                // Si falló (ej. status 400 o 401), inyectamos el texto del error en el HTML
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