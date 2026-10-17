document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRegistro');
    const mensajeError = document.getElementById('mensajeError');
    const mensajeExito = document.getElementById('mensajeExito');

    mensajeError.style.display = 'none';
    mensajeExito.style.display = 'none';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const usuario = document.getElementById('usuario').value;
        const password = document.getElementById('password').value;
        const rol = document.getElementById('rol').value;

        try {
            const respuesta = await fetch('/login/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, apellido, usuario, password, rol, estado: 'activo' })
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                mensajeExito.textContent = '¡Usuario creado con éxito! Redirigiendo...';
                mensajeExito.style.display = 'block';
                mensajeError.style.display = 'none';
                setTimeout(() => window.location.href = '/login', 2000);
            } else {
                mensajeError.textContent = data.error || 'Error al crear usuario.';
                mensajeError.style.display = 'block';
            }
        } catch (error) {
            mensajeError.textContent = 'Error de conexión con el servidor.';
            mensajeError.style.display = 'block';
        }
    });
});