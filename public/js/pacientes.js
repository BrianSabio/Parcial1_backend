document.addEventListener('DOMContentLoaded', () => {
  cargarPacientes();
  configurarFormulario();
});

async function cargarPacientes() {
  try {
    const respuesta = await fetch('/api/pacientes');
    const pacientes = await respuesta.json();

    const tbody = document.querySelector('#cuerpoTablaPacientes');
    const sinPacientes = document.querySelector('#sinPacientes');

    if (pacientes.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (sinPacientes) sinPacientes.style.display = 'block';
      return;
    }

    if (sinPacientes) sinPacientes.style.display = 'none';

    tbody.innerHTML = pacientes.map(paciente => `
      <tr data-id="${paciente._id}">
        <td>${paciente.nombre}</td>
        <td>${paciente.apellido}</td>
        <td>${paciente.dni}</td>
        <td>${paciente.telefono || '-'}</td>
        <td>${paciente.email || '-'}</td>
        <td>
          <button class="btn-editar" onclick="editarPaciente('${paciente._id}')">Editar</button>
          <button class="btn-eliminar" onclick="eliminarPaciente('${paciente._id}')">Eliminar</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Error cargando pacientes:', error);
    alert('Error al cargar pacientes');
  }
}

function configurarFormulario() {
  const formulario = document.querySelector('#formPaciente');
  if (!formulario) return;

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.querySelector('#nombre').value;
    const apellido = document.querySelector('#apellido').value;
    const dni = document.querySelector('#dni').value;
    const telefono = document.querySelector('#telefono').value;
    const email = document.querySelector('#email').value;

    try {
      const respuesta = await fetch('/api/pacientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre,
          apellido,
          dni,
          telefono: telefono || null,
          email: email || null
        })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        console.log('Paciente creado:', data);
        formulario.reset();
        cargarPacientes();
      } else {
        alert('Error: ' + (data.error || 'No se pudo crear el paciente'));
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error al conectar con el servidor');
    }
  });
}

async function eliminarPaciente(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este paciente?')) return;

  try {
    const respuesta = await fetch(`/api/pacientes/${id}`, {
      method: 'DELETE'
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
      console.log('Paciente eliminado:', data);
      cargarPacientes();
    } else {
      alert('Error: ' + (data.error || 'No se pudo eliminar el paciente'));
    }
  } catch (error) {
    console.error('Error de red:', error);
    alert('Error al conectar con el servidor');
  }
}

function editarPaciente(id) {
  console.log('Editar paciente:', id);
  alert('Funcionalidad de edición en desarrollo');
}
