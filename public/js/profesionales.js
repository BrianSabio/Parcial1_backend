document.addEventListener('DOMContentLoaded', () => {
  cargarProfesionales();
  configurarFormulario();
});

async function cargarProfesionales() {
    try {
        const respuesta = await fetch('/api/profesionales');
        const profesionales = await respuesta.json();

        const contenedor = document.querySelector('#contenedorTabla');
        const sinProfesionales = document.querySelector('#sinProfesionales');

        if (profesionales.length === 0) {
            contenedor.innerHTML = '<p class="vacio" id="sinProfesionales">No hay profesionales registrados todavía.</p>';
            return;
        }

        contenedor.innerHTML = `
            <table class="listado" id="tablaProfesionales">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Especialidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="cuerpoTablaProfesionales">
                    ${profesionales.map(p => `
                        <tr>
                            <td>${p.nombre}</td>
                            <td>${p.apellido}</td>
                            <td>${p.especialidad}</td>
                            <td>
                                <button class="btn-eliminar" onclick="eliminarProfesional('${p._id}')">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('Error cargando profesionales:', error);
    }
}

function configurarFormulario() {
  const formulario = document.querySelector('#formProfesional');
  if (!formulario) return;

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.querySelector('#nombre').value;
    const apellido = document.querySelector('#apellido').value;
    const especialidad = document.querySelector('#especialidad').value;

    try {
      const respuesta = await fetch('/api/profesionales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre,
          apellido,
          especialidad
        })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        console.log('Profesional creado:', data);
        formulario.reset();
        cargarProfesionales();
      } else {
        alert('Error: ' + (data.error || 'No se pudo crear el profesional'));
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error al conectar con el servidor');
    }
  });
}

async function eliminarProfesional(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este profesional?')) return;

  try {
    const respuesta = await fetch(`/api/profesionales/${id}`, {
      method: 'DELETE'
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
      console.log('Profesional eliminado:', data);
      cargarProfesionales();
    } else {
      alert('Error: ' + (data.error || 'No se pudo eliminar el profesional'));
    }
  } catch (error) {
    console.error('Error de red:', error);
    alert('Error al conectar con el servidor');
  }
}

function editarProfesional(id) {
  console.log('Editar profesional:', id);
  alert('Funcionalidad de edición en desarrollo');
}
