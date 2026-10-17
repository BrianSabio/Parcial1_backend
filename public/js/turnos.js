document.addEventListener('DOMContentLoaded', () => {
  cargarTurnos();
  configurarFormulario();
});

async function cargarTurnos() {
  try {
    const respuesta = await fetch('/api/turnos');
    const turnos = await respuesta.json();

    const tbody = document.querySelector('#cuerpoTablaTurnos');
    const sinTurnos = document.querySelector('#sinTurnos');
    const tabla = document.querySelector('#tablaTurnos');

    if (turnos.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (sinTurnos) sinTurnos.style.display = 'block';
      if (tabla) tabla.style.display = 'none';
      return;
    }

    if (sinTurnos) sinTurnos.style.display = 'none';
    if (tabla) tabla.style.display = 'table';

    tbody.innerHTML = turnos.map(turno => `
      <tr data-id="${turno._id}">
        <td>${turno.fecha}</td>
        <td>${turno.hora}</td>
        <td>${turno.pacienteId ? turno.pacienteId.nombre + ' ' + turno.pacienteId.apellido : 'Sin datos'}</td>
        <td>${turno.profesionalId ? turno.profesionalId.nombre + ' ' + turno.profesionalId.apellido : 'Sin datos'}</td> 
        <td>${turno.estado}</td>
        <td>
          <button class="btn-eliminar" onclick="eliminarTurno('${turno._id}')">Cancelar</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Error cargando turnos:', error);
    alert('Error al cargar la lista de turnos');
  }
}

function configurarFormulario() {
  const formulario = document.querySelector('#formTurno');
  if (!formulario) return;

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fecha = document.querySelector('#fecha').value;
    const hora = document.querySelector('#hora').value;
    const pacienteId = document.querySelector('#pacienteId').value;
    const profesionalId = document.querySelector('#profesionalId').value;
    const servicioId = document.querySelector('#servicioId').value;

    try {
      const respuesta = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId, profesionalId, servicioId, fecha, hora })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        formulario.reset();
        cargarTurnos(); // Recarga la tabla sin refrescar la página
      } else {
        alert('Respuesta del servidor ' + JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error al conectar con el servidor');
    }
  });
}

async function eliminarTurno(id) {
  if (!confirm('¿Estás seguro de que deseas cancelar este turno?')) return;

  try {
    const respuesta = await fetch(`/api/turnos/${id}`, {
      method: 'DELETE'
    });

    if (respuesta.ok) {
      cargarTurnos();
    } else {
      const data = await respuesta.json();
      alert('Error: ' + (data.error || 'No se pudo cancelar el turno'));
    }
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
}