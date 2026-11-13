document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formRegistro');
  const mensajeError = document.getElementById('mensajeError');
  const mensajeExito = document.getElementById('mensajeExito');

  if (!form) return;

  mensajeError.style.display = 'none';
  mensajeExito.style.display = 'none';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email')?.value.trim() || '';
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol')?.value || 'paciente';

    try {
      const respuesta = await fetch('/login/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          dni,
          telefono,
          email,
          usuario,
          password,
          rol,
          estado: 'activo'
        })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        mensajeExito.textContent = '¡Usuario creado con éxito! Redirigiendo...';
        mensajeExito.style.display = 'block';
        mensajeError.style.display = 'none';
        form.reset();
        setTimeout(() => (window.location.href = '/login'), 2000);
      } else {
        mensajeError.textContent = data.mensaje || data.error || 'Error al crear usuario.';
        mensajeError.style.display = 'block';
        mensajeExito.style.display = 'none';
      }
    } catch (error) {
      mensajeError.textContent = 'Error de conexión con el servidor.';
      mensajeError.style.display = 'block';
      mensajeExito.style.display = 'none';
    }
  });
});