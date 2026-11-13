let listaProfesionalesCache = [];

document.addEventListener('DOMContentLoaded', () => {
  cargarProfesionales();
  configurarFormulario();

  const filtroEstado = document.querySelector('#filtroEstadoProf');
  if (filtroEstado) {
    filtroEstado.addEventListener('change', renderizarTablaProfesionales);
  }
});

async function cargarProfesionales() {
  try {
    const respuesta = await fetch('/api/profesionales');
    if (!respuesta.ok) {
      console.error('Error HTTP al cargar profesionales:', respuesta.status);
      return;
    }
    listaProfesionalesCache = await respuesta.json();
    renderizarTablaProfesionales();
  } catch (error) {
    console.error('Error cargando profesionales:', error);
  }
}

function renderizarTablaProfesionales() {
  const contenedor = document.querySelector('#contenedorTabla');
  const rol = document.querySelector('.admin-page')?.dataset.rol || '';
  const puedeEditar = ['administrativo', 'coordinador'].includes(rol);
  const puedeCambiarEstado = ['administrativo', 'coordinador', 'director'].includes(rol);
  const filtroSeleccionado = document.querySelector('#filtroEstadoProf')?.value || 'todos';

  const filtrados = listaProfesionalesCache.filter(p => {
    const estadoProf = p.estado || 'activo';
    return filtroSeleccionado === 'todos' || estadoProf === filtroSeleccionado;
  });

  if (filtrados.length === 0) {
    const textoVacio = filtroSeleccionado === 'todos'
      ? 'No hay profesionales registrados todavía.'
      : `No hay profesionales en estado "${filtroSeleccionado}".`;
    contenedor.innerHTML = `<p class="vacio" id="sinProfesionales">${textoVacio}</p>`;
    return;
  }

  contenedor.innerHTML = `
    <table class="listado" id="tablaProfesionales">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Especialidad</th>
          <th>Matrícula</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Estado</th>
          ${puedeCambiarEstado ? '<th>Acciones</th>' : ''}
        </tr>
      </thead>
      <tbody id="cuerpoTablaProfesionales">
        ${filtrados.map(p => {
          const estadoActual = p.estado || 'activo';
          const badgeClase = estadoActual === 'activo' ? 'estado-reservado' : 'estado-cancelado';
          return `
            <tr>
              <td>${p.nombre}</td>
              <td>${p.apellido}</td>
              <td>${p.especialidad}</td>
              <td>${p.matricula || '-'}</td>
              <td>${p.telefono || '-'}</td>
              <td>${p.email || '-'}</td>
              <td><span class="estado-badge ${badgeClase}">${estadoActual}</span></td>
              ${puedeCambiarEstado ? `
                <td style="white-space:nowrap;">
                  ${puedeEditar ? `<button type="button" class="btn-editar" onclick="cargarEdicionProfesional('${p._id}')">Editar</button>` : ''}
                  <button type="button" class="btn-cancelar-turno" onclick="alternarEstadoProfesional('${p._id}', '${estadoActual}')">
                    ${estadoActual === 'activo' ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              ` : ''}
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function configurarFormulario() {
  const formulario = document.querySelector('#formProfesional');
  const btnCancelar = document.querySelector('#btnCancelarEdicionProf');
  if (!formulario) return;

  if (btnCancelar) {
    btnCancelar.addEventListener('click', resetearFormularioProfesional);
  }

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idEdit = document.querySelector('#profesionalIdEdit')?.value;
    const payload = {
      nombre: document.querySelector('#nombre').value.trim(),
      apellido: document.querySelector('#apellido').value.trim(),
      especialidad: document.querySelector('#especialidad').value.trim(),
      matricula: document.querySelector('#matricula').value.trim(),
      telefono: document.querySelector('#telefono').value.trim(),
      email: document.querySelector('#email').value.trim(),
      estado: document.querySelector('#estado').value
    };

    const url = idEdit ? `/api/profesionales/${idEdit}` : '/api/profesionales';
    const method = idEdit ? 'PUT' : 'POST';

    try {
      const respuesta = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        resetearFormularioProfesional();
        cargarProfesionales();
      } else {
        alert('Error: ' + (data.mensaje || data.error || 'No se pudo guardar el profesional'));
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error al conectar con el servidor');
    }
  });
}

function cargarEdicionProfesional(id) {
  const prof = listaProfesionalesCache.find(p => p._id === id);
  if (!prof) return;

  document.querySelector('#profesionalIdEdit').value = prof._id;
  document.querySelector('#nombre').value = prof.nombre || '';
  document.querySelector('#apellido').value = prof.apellido || '';
  document.querySelector('#especialidad').value = prof.especialidad || '';
  document.querySelector('#matricula').value = prof.matricula || '';
  document.querySelector('#telefono').value = prof.telefono || '';
  document.querySelector('#email').value = prof.email || '';
  document.querySelector('#estado').value = prof.estado || 'activo';

  document.querySelector('#tituloFormProfesional').textContent = `Editando a ${prof.nombre} ${prof.apellido}`;
  document.querySelector('#btnGuardarProfesional').textContent = 'Guardar Cambios';
  document.querySelector('#btnCancelarEdicionProf').style.display = 'inline-block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetearFormularioProfesional() {
  const formulario = document.querySelector('#formProfesional');
  if (formulario) formulario.reset();
  document.querySelector('#profesionalIdEdit').value = '';
  document.querySelector('#estado').value = 'activo';
  document.querySelector('#tituloFormProfesional').textContent = 'Agregar Profesional';
  document.querySelector('#btnGuardarProfesional').textContent = 'Guardar Profesional';
  document.querySelector('#btnCancelarEdicionProf').style.display = 'none';
}

async function alternarEstadoProfesional(id, estadoActual) {
  const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
  const accionTexto = nuevoEstado === 'inactivo' ? 'desactivar' : 'reactivar';
  if (!confirm(`¿Seguro que deseas ${accionTexto} a este profesional?`)) return;

  try {
    const respuesta = await fetch(`/api/profesionales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (respuesta.ok) {
      cargarProfesionales();
    } else {
      const data = await respuesta.json();
      alert('Error: ' + (data.mensaje || data.error || 'No se pudo actualizar el estado'));
    }
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
}