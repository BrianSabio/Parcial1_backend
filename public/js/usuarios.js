document.addEventListener('DOMContentLoaded', async () => {
  const rolActual = document.querySelector('.admin-page')?.dataset.rol || '';
  const selectRol = document.querySelector('#rol');
  const grupoProfRef = document.querySelector('#grupoProfRef');

  if (rolActual === 'coordinador' && selectRol && grupoProfRef) {
    await cargarSelectProfesionales();
    selectRol.addEventListener('change', () => {
      grupoProfRef.style.display = selectRol.value === 'profesional' ? 'flex' : 'none';
    });
  }

  await cargarUsuariosEquipo();
  configurarFormUsuario();
});

async function cargarSelectProfesionales() {
  const selectProf = document.querySelector('#profesionalRef');
  if (!selectProf) return;
  try {
    const res = await fetch('/api/profesionales');
    if (res.ok) {
      const profs = await res.json();
      profs.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p._id;
        opt.textContent = `${p.apellido.toUpperCase()}, ${p.nombre} (${p.especialidad})`;
        selectProf.appendChild(opt);
      });
    }
  } catch (e) {
    console.error('Error cargando profesionales:', e);
  }
}

async function cargarUsuariosEquipo() {
  const contenedor = document.querySelector('#contenedorUsuariosEquipo');
  try {
    const res = await fetch('/api/usuarios');
    const usuarios = await res.json();

    if (!usuarios.length) {
      contenedor.innerHTML = '<p class="vacio">No hay usuarios cargados en esta categoría todavía.</p>';
      return;
    }

    contenedor.innerHTML = `
      <table class="listado">
        <thead>
          <tr>
            <th>Nombre y Apellido</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Ficha Vinculada</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios.map(u => {
            const activo = u.estado === 'activo';
            const ficha = u.profesionalRef ? `${u.profesionalRef.nombre} ${u.profesionalRef.apellido}` : '-';
            return `
              <tr>
                <td>${u.nombre} ${u.apellido}</td>
                <td><strong>${u.usuario}</strong></td>
                <td style="text-transform:capitalize;">${u.rol}</td>
                <td>${ficha}</td>
                <td><span class="estado-badge ${activo ? 'estado-reservado' : 'estado-cancelado'}">${u.estado}</span></td>
                <td>
                  <button type="button" class="btn-cancelar-turno" onclick="cambiarEstadoUsuario('${u._id}', '${activo ? 'inactivo' : 'activo'}')">
                    ${activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error cargando usuarios:', error);
  }
}

function configurarFormUsuario() {
  const form = document.querySelector('#formUsuarioEquipo');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rol = document.querySelector('#rol').value;
    const payload = {
      nombre: document.querySelector('#nombre').value,
      apellido: document.querySelector('#apellido').value,
      usuario: document.querySelector('#usuario').value,
      password: document.querySelector('#password').value,
      rol,
      profesionalRef: rol === 'profesional' ? document.querySelector('#profesionalRef')?.value : null
    };

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        form.reset();
        const grupoProf = document.querySelector('#grupoProfRef');
        if (grupoProf) grupoProf.style.display = 'none';
        await cargarUsuariosEquipo();
      } else {
        alert('Error: ' + (data.mensaje || 'No se pudo crear el usuario'));
      }
    } catch (error) {
      alert('Error de conexión con el servidor');
    }
  });
}

async function cambiarEstadoUsuario(id, nuevoEstado) {
  if (!confirm(`¿Confirmás pasar este usuario a estado ${nuevoEstado}?`)) return;
  try {
    const res = await fetch(`/api/usuarios/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (res.ok) {
      await cargarUsuariosEquipo();
    } else {
      const data = await res.json();
      alert('Error: ' + (data.mensaje || 'No se pudo actualizar'));
    }
  } catch (error) {
    alert('Error de conexión');
  }
}