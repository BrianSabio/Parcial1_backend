let todosProfesionales = [];
let todasDisponibilidades = [];
let todosTurnosSistema = [];
let todosPacientesAdmin = [];
let paquetesPacienteActual = [];
let seleccionActual = null;
let fpCalendario = null;
let turnosCobrados = new Set(); // Registro visual de cobros realizados en sesión

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.querySelector('.turnos-page');
  const rol = page?.dataset.rol || 'paciente';
  const pacienteId = page?.dataset.pacienteId || '';

  await cargarTablaTurnos(rol);

  if (rol !== 'profesional' && rol !== 'director') {
    await inicializarBuscadorTurnos(rol, pacienteId);
  }
});

async function inicializarBuscadorTurnos(rol, pacienteIdInicial) {
  const buscadorPacienteInput = document.querySelector('#buscadorPacienteAdmin');
  const selectServicio = document.querySelector('#selectServicio');
  const buscadorInput = document.querySelector('#buscadorProf');
  const filtroFecha = document.querySelector('#filtroFecha');
  const btnLimpiarFecha = document.querySelector('#btnLimpiarFecha');

  try {
    if (rol !== 'paciente' && buscadorPacienteInput) {
      const resPac = await fetch('/api/pacientes');
      if (resPac.ok) {
        todosPacientesAdmin = await resPac.json();
      }
      configurarAutocompletadoPacientes();
      await cargarPaquetesPaciente('');
    } else if (rol === 'paciente') {
      await cargarPaquetesPaciente(pacienteIdInicial);
    }

    if (selectServicio) {
      selectServicio.addEventListener('change', () => {
        actualizarIndicadorCobertura();
      });
    }

    const [resProf, resDisp] = await Promise.all([
      fetch('/api/profesionales'),
      fetch('/api/disponibilidad')
    ]);

    const profRaw = resProf.ok ? await resProf.json() : [];
    todosProfesionales = profRaw.filter(p => (p.estado || 'activo') === 'activo');

    const idsActivos = new Set(todosProfesionales.map(p => p._id));
    const dispRaw = resDisp.ok ? await resDisp.json() : [];
    todasDisponibilidades = dispRaw.filter(d => {
      const idProf = d.profesionalId?._id || d.profesionalId;
      return d.disponible && idsActivos.has(idProf);
    });

    await actualizarAgendaGlobalProfesionales();
    renderizarFiltroEspecialidades();

    if (buscadorInput) {
      buscadorInput.addEventListener('input', renderizarTarjetasProfesionales);
    }

    if (filtroFecha) {
      const hoyStr = new Date().toISOString().split('T')[0];
      const fechasDisponiblesUnicas = [
        ...new Set(todasDisponibilidades.filter(d => d.fecha >= hoyStr).map(d => d.fecha))
      ].sort();

      if (typeof flatpickr !== 'undefined') {
        fpCalendario = flatpickr(filtroFecha, {
          locale: 'es',
          dateFormat: 'Y-m-d',
          altInput: true,
          altFormat: 'd/m/Y',
          altInputClass: 'form-control',
          minDate: 'today',
          enable: fechasDisponiblesUnicas.length > 0 ? fechasDisponiblesUnicas : [],
          disableMobile: true,
          onChange: () => renderizarTarjetasProfesionales()
        });
        if (fpCalendario.altInput) {
          fpCalendario.altInput.placeholder = 'Seleccionar fecha...';
        }
      } else {
        filtroFecha.min = hoyStr;
        filtroFecha.addEventListener('change', renderizarTarjetasProfesionales);
      }
    }

    if (btnLimpiarFecha && filtroFecha) {
      btnLimpiarFecha.addEventListener('click', () => {
        if (fpCalendario) {
          fpCalendario.clear();
        } else {
          filtroFecha.value = '';
        }
        renderizarTarjetasProfesionales();
      });
    }

    renderizarTarjetasProfesionales();

  } catch (error) {
    console.error('Error inicializando buscador:', error);
  }
}

function configurarAutocompletadoPacientes() {
  const input = document.querySelector('#buscadorPacienteAdmin');
  const hiddenId = document.querySelector('#selectPacienteAdmin');
  const dropdown = document.querySelector('#resultadosPacienteAdmin');
  const infoBox = document.querySelector('#infoPacienteSeleccionado');

  if (!input || !dropdown) return;

  const mostrarResultados = (termino) => {
    const q = termino.toLowerCase().trim();
    const coincidencias = q
      ? todosPacientesAdmin.filter(p =>
          (p.dni && p.dni.toLowerCase().includes(q)) ||
          (p.apellido && p.apellido.toLowerCase().includes(q)) ||
          (p.nombre && p.nombre.toLowerCase().includes(q))
        )
      : todosPacientesAdmin.slice(0, 8);

    if (coincidencias.length === 0) {
      dropdown.innerHTML = '<div class="autocomplete-item" style="color:#64748b; cursor:default;">Sin pacientes coincidentes</div>';
      dropdown.style.display = 'block';
      return;
    }

    dropdown.innerHTML = coincidencias.map(p => `
      <div class="autocomplete-item" data-id="${p._id}">
        <strong>${p.apellido.toUpperCase()}, ${p.nombre}</strong>
        <span style="display:block; font-size:0.8rem; color:#64748b;">DNI: ${p.dni}</span>
      </div>
    `).join('');

    dropdown.style.display = 'block';

    dropdown.querySelectorAll('.autocomplete-item[data-id]').forEach(item => {
      item.addEventListener('click', async () => {
        const idSel = item.dataset.id;
        const pac = todosPacientesAdmin.find(x => x._id === idSel);
        if (!pac) return;

        hiddenId.value = pac._id;
        input.value = `${pac.apellido.toUpperCase()}, ${pac.nombre} (DNI: ${pac.dni})`;
        dropdown.style.display = 'none';

        if (infoBox) {
          infoBox.style.display = 'block';
          infoBox.innerHTML = `
            <strong>Paciente:</strong> ${pac.nombre} ${pac.apellido}<br>
            <span>DNI: ${pac.dni} ${pac.telefono ? '· Tel: ' + pac.telefono : ''}</span>
          `;
        }

        await cargarPaquetesPaciente(pac._id);
      });
    });
  };

  input.addEventListener('input', () => {
    hiddenId.value = '';
    if (infoBox) infoBox.style.display = 'none';
    mostrarResultados(input.value);
  });

  input.addEventListener('focus', () => {
    mostrarResultados(input.value);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.paciente-search-wrapper')) {
      dropdown.style.display = 'none';
    }
  });
}

async function actualizarAgendaGlobalProfesionales() {
  try {
    const promesas = todosProfesionales.map(p =>
      fetch(`/api/turnos/profesional/${p._id}`).then(r => r.ok ? r.json() : [])
    );
    const resultados = await Promise.all(promesas);
    todosTurnosSistema = resultados.flat();
  } catch (error) {
    console.error('Error sincronizando agendas:', error);
  }
}

async function cargarPaquetesPaciente(pacienteId) {
  const selectServicio = document.querySelector('#selectServicio');
  const estadoBox = document.querySelector('#estadoCoberturaBox');
  if (!selectServicio) return;

  selectServicio.innerHTML = '';
  paquetesPacienteActual = [];

  if (!pacienteId) {
    selectServicio.innerHTML = '<option value="">Seleccioná un paciente primero...</option>';
    if (estadoBox) estadoBox.style.display = 'none';
    return;
  }

  try {
    const res = await fetch('/api/servicios');
    const servicios = res.ok ? await res.json() : [];
    paquetesPacienteActual = servicios.filter(s => {
      const idPac = s.pacienteId?._id || s.pacienteId;
      return idPac === pacienteId && s.sesionesConsumidas < s.sesionesTotales && s.tipo !== 'Consulta Particular';
    });

    if (paquetesPacienteActual.length > 0) {
      const optOS = document.createElement('option');
      optOS.value = paquetesPacienteActual[0]._id;
      optOS.textContent = 'Obra Social';
      optOS.selected = true;
      selectServicio.appendChild(optOS);
    }

    const optParticular = document.createElement('option');
    optParticular.value = 'PARTICULAR';
    optParticular.textContent = 'Particular';
    selectServicio.appendChild(optParticular);

    actualizarIndicadorCobertura();
  } catch (error) {
    console.error('Error cargando cobertura:', error);
  }
}

function actualizarIndicadorCobertura() {
  const selectServicio = document.querySelector('#selectServicio');
  const estadoBox = document.querySelector('#estadoCoberturaBox');
  if (!selectServicio || !estadoBox) return;

  const valor = selectServicio.value;
  if (!valor || valor === 'PARTICULAR') {
    estadoBox.style.display = 'none';
    return;
  }

  const paquete = paquetesPacienteActual.find(p => p._id === valor);
  if (paquete) {
    const disponibles = paquete.sesionesTotales - paquete.sesionesConsumidas;
    estadoBox.style.display = 'block';
    estadoBox.innerHTML = `
      <div style="color: var(--dark-blue); font-weight: 600; margin-bottom: 0.25rem;">
        <i class="fas fa-notes-medical" style="color: var(--cyan);"></i> Cobertura Obra Social
      </div>
      <div style="font-size: 0.84rem; color: #334155;">
        Autorizadas: <strong>${paquete.sesionesTotales} sesiones</strong><br>
        Realizadas: <strong>${paquete.sesionesConsumidas}</strong> · Disponibles: <strong style="color: #0d9488;">${disponibles}</strong>
      </div>
    `;
  } else {
    estadoBox.style.display = 'none';
  }
}

function obtenerArancelParticular(especialidad) {
  const esp = (especialidad || '').toLowerCase();
  if (esp.includes('traumatolog')) return 35000;
  if (esp.includes('neuro') || esp.includes('osteopat')) return 32000;
  if (esp.includes('pedi')) return 28000;
  return 25000;
}

function renderizarFiltroEspecialidades() {
  const contenedor = document.querySelector('#listaEspecialidades');
  if (!contenedor) return;

  const especialidadesUnicas = [...new Set(todosProfesionales.map(p => p.especialidad).filter(Boolean))];

  let html = `
    <label class="esp-item">
      <input type="radio" name="filtroEspecialidad" value="todas" checked>
      <span>Todas (${todosProfesionales.length})</span>
    </label>
  `;

  especialidadesUnicas.forEach(esp => {
    const cantidad = todosProfesionales.filter(p => p.especialidad === esp).length;
    html += `
      <label class="esp-item">
        <input type="radio" name="filtroEspecialidad" value="${esp}">
        <span>${esp} (${cantidad})</span>
      </label>
    `;
  });

  contenedor.innerHTML = html;

  contenedor.querySelectorAll('input[name="filtroEspecialidad"]').forEach(radio => {
    radio.addEventListener('change', renderizarTarjetasProfesionales);
  });
}

function renderizarTarjetasProfesionales() {
  const contenedor = document.querySelector('#contenedorProfesionales');
  if (!contenedor) return;

  const espSeleccionada = document.querySelector('input[name="filtroEspecialidad"]:checked')?.value || 'todas';
  const fechaSeleccionada = document.querySelector('#filtroFecha')?.value || '';
  const textoBusqueda = (document.querySelector('#buscadorProf')?.value || '').toLowerCase().trim();
  const hoyStr = new Date().toISOString().split('T')[0];

  const filtrados = todosProfesionales.filter(prof => {
    const coincideEsp = espSeleccionada === 'todas' || prof.especialidad === espSeleccionada;
    const nombreCompleto = `${prof.nombre} ${prof.apellido}`.toLowerCase();
    const coincideTexto = !textoBusqueda || nombreCompleto.includes(textoBusqueda);

    const dispsProf = todasDisponibilidades.filter(d =>
      (d.profesionalId?._id || d.profesionalId) === prof._id && d.fecha >= hoyStr
    );
    const coincideFecha = !fechaSeleccionada || dispsProf.some(d => d.fecha === fechaSeleccionada);

    return coincideEsp && coincideTexto && coincideFecha;
  });

  if (filtrados.length === 0) {
    contenedor.innerHTML = '<div class="empty-card">No se encontraron profesionales disponibles para la fecha o especialidad elegida.</div>';
    return;
  }

  contenedor.innerHTML = filtrados.map(prof => {
    const iniciales = `${prof.nombre?.[0] || ''}${prof.apellido?.[0] || ''}`.toUpperCase();
    const duracionMin = (prof.especialidad || '').toLowerCase().includes('traumatolog') ? 30 : 45;

    let dispsProf = todasDisponibilidades.filter(d =>
      (d.profesionalId?._id || d.profesionalId) === prof._id && d.fecha >= hoyStr
    );
    if (fechaSeleccionada) {
      dispsProf = dispsProf.filter(d => d.fecha === fechaSeleccionada);
    }

    let fechasUnicas = [...new Set(dispsProf.map(d => d.fecha))].sort();

    if (!fechaSeleccionada && fechasUnicas.length > 2) {
      fechasUnicas = fechasUnicas.slice(0, 2);
    }

    let bloquesFechasHTML = '';

    if (fechasUnicas.length === 0) {
      bloquesFechasHTML = '<p class="sin-agenda">Sin horarios publicados próximamente.</p>';
    } else {
      bloquesFechasHTML = fechasUnicas.map(fecha => {
        const rangos = dispsProf.filter(d => d.fecha === fecha);
        const ocupados = todosTurnosSistema
          .filter(t => (t.profesionalId?._id || t.profesionalId) === prof._id && t.fecha === fecha && t.estado !== 'cancelado')
          .map(t => t.hora);

        const todosLosSlots = [];
        rangos.forEach(r => {
          const [h, m] = r.horaInicio.split(':').map(Number);
          const [hFin, mFin] = r.horaFin.split(':').map(Number);
          for (let min = h * 60 + m; min + duracionMin <= hFin * 60 + mFin; min += duracionMin) {
            const hh = String(Math.floor(min / 60)).padStart(2, '0');
            const mm = String(min % 60).padStart(2, '0');
            const horaStr = `${hh}:${mm}`;
            if (!todosLosSlots.includes(horaStr)) {
              todosLosSlots.push(horaStr);
            }
          }
        });

        const pillsHTML = todosLosSlots.sort().map(hora => {
          const estaOcupado = ocupados.includes(hora);
          if (estaOcupado) {
            return `<button type="button" class="slot-pill occupied" disabled title="Horario reservado">${hora}</button>`;
          }
          const isSelected = seleccionActual?.profesionalId === prof._id && seleccionActual?.fecha === fecha && seleccionActual?.hora === hora;
          return `<button type="button" class="slot-pill ${isSelected ? 'selected' : ''}" onclick="seleccionarSlot('${prof._id}', '${fecha}', '${hora}')">${hora}</button>`;
        }).join('');

        return `
          <div class="fecha-row">
            <div class="fecha-label">
              <strong>${formatearFechaConDia(fecha)}</strong>
              <span>Duración estimada: ${duracionMin} min</span>
            </div>
            <div class="slots-grid">${pillsHTML}</div>
          </div>
        `;
      }).join('');
    }

    const tieneSeleccionAqui = seleccionActual?.profesionalId === prof._id;

    return `
      <article class="prof-card">
        <div class="prof-info">
          <div class="prof-avatar">${iniciales}</div>
          <div>
            <h4>${prof.apellido.toUpperCase()}, ${prof.nombre}</h4>
            <span class="prof-badge">${prof.especialidad}</span>
            <p class="prof-sede">CIKIRE · Villa Urquiza</p>
          </div>
        </div>
        <div class="prof-agenda">
          ${bloquesFechasHTML}
          <div class="prof-actions">
            ${tieneSeleccionAqui 
              ? `<span class="seleccion-resumen">Seleccionado: <strong>${formatearFechaConDia(seleccionActual.fecha)} · ${seleccionActual.hora} hs</strong></span>
                 <button type="button" class="btn btn-primary" onclick="confirmarReserva()">Reservar turno <i class="fas fa-check"></i></button>`
              : `<span class="hint-text">Hacé clic en un horario disponible para reservar</span>`
            }
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function seleccionarSlot(profesionalId, fecha, hora) {
  seleccionActual = { profesionalId, fecha, hora };
  renderizarTarjetasProfesionales();
}

async function confirmarReserva() {
  if (!seleccionActual) return;

  const page = document.querySelector('.turnos-page');
  const rol = page?.dataset.rol || 'paciente';
  const pacienteId = rol === 'paciente'
    ? page.dataset.pacienteId
    : document.querySelector('#selectPacienteAdmin')?.value;
  let servicioId = document.querySelector('#selectServicio')?.value;

  if (!pacienteId) {
    alert('Por favor, buscá y seleccioná un paciente.');
    return;
  }
  if (!servicioId) {
    alert('Por favor, seleccioná una cobertura.');
    return;
  }

  try {
    if (servicioId === 'PARTICULAR') {
      const resServ = await fetch('/api/servicios');
      const listaServ = resServ.ok ? await resServ.json() : [];
      const bonoParticularExistente = listaServ.find(s =>
        (s.pacienteId?._id || s.pacienteId) === pacienteId &&
        s.tipo === 'Consulta Particular' &&
        s.sesionesConsumidas < s.sesionesTotales
      );

      if (bonoParticularExistente) {
        servicioId = bonoParticularExistente._id;
      } else {
        const crearPart = await fetch('/api/servicios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pacienteId, tipo: 'Consulta Particular', sesionesTotales: 1 })
        });
        if (crearPart.ok) {
          const nuevoBono = await crearPart.json();
          servicioId = nuevoBono._id;
        } else {
          alert('No se pudo registrar la consulta particular.');
          return;
        }
      }
    }

    const respuesta = await fetch('/api/turnos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pacienteId,
        profesionalId: seleccionActual.profesionalId,
        servicioId,
        fecha: seleccionActual.fecha,
        hora: seleccionActual.hora
      })
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
      alert('¡Turno reservado con éxito en CIKIRE!');
      seleccionActual = null;
      await actualizarAgendaGlobalProfesionales();
      await cargarTablaTurnos(rol);
      await cargarPaquetesPaciente(pacienteId);
      renderizarTarjetasProfesionales();
    } else {
      alert('No se pudo reservar: ' + (data.mensaje || 'Error en la solicitud'));
    }
  } catch (error) {
    console.error('Error al reservar:', error);
    alert('Error de conexión con el servidor.');
  }
}

async function cargarTablaTurnos(rol) {
  try {
    const respuesta = await fetch('/api/turnos');
    const turnos = await respuesta.json();

    if (!respuesta.ok) throw new Error(turnos.mensaje || 'Error al obtener turnos');

    const tbody = document.querySelector('#cuerpoTablaTurnos');
    const sinTurnos = document.querySelector('#sinTurnos');
    const tabla = document.querySelector('#tablaTurnos');
    const esGestion = ['administrativo', 'coordinador', 'recepcionista'].includes(rol);

    if (turnos.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (sinTurnos) sinTurnos.style.display = 'block';
      if (tabla) tabla.style.display = 'none';
      return;
    }

    if (sinTurnos) sinTurnos.style.display = 'none';
    if (tabla) tabla.style.display = 'table';

    tbody.innerHTML = turnos.map(turno => {
      const columnaPaciente = rol !== 'paciente'
        ? `<td>${turno.pacienteId ? `${turno.pacienteId.nombre} ${turno.pacienteId.apellido}` : 'Sin datos'}</td>`
        : '';

      const esParticular = turno.servicioId?.tipo === 'Consulta Particular';
      const monto = obtenerArancelParticular(turno.profesionalId?.especialidad);
      const yaCobrado = turnosCobrados.has(turno._id);

      let botonCobroHTML = '';
      if (esGestion && esParticular && turno.estado !== 'cancelado') {
        botonCobroHTML = yaCobrado
          ? `<span class="pago-ok-tag" style="margin-right:0.5rem;"><i class="fas fa-check-circle"></i> Cobrado ($${monto.toLocaleString('es-AR')})</span>`
          : `<button type="button" class="btn-cobrar-tabla" onclick="registrarCobroTurno('${turno._id}', ${monto})"><i class="fas fa-dollar-sign"></i> Cobrar ($${monto.toLocaleString('es-AR')})</button>`;
      }

      let botonAccionTurnoHTML = '';
      if (turno.estado === 'reservado') {
        if (rol === 'profesional') {
          botonAccionTurnoHTML = `<button type="button" class="btn-cobrar-tabla" onclick="marcarTurnoAtendido('${turno._id}')"><i class="fas fa-check"></i> Marcar Atendido</button>`;
        } else {
          botonAccionTurnoHTML = `<button class="btn-cancelar-turno" onclick="cancelarTurnoPaciente('${turno._id}')">Cancelar</button>`;
        }
      }

      const columnaAcciones = rol !== 'director'
        ? `<td>${botonCobroHTML} ${botonAccionTurnoHTML || (!botonCobroHTML ? '-' : '')}</td>`
        : '';

      return `
        <tr data-id="${turno._id}">
          <td><strong>${formatearFechaConDia(turno.fecha)}</strong></td>
          <td>${turno.hora} hs</td>
          ${columnaPaciente}
          <td>${turno.profesionalId ? `${turno.profesionalId.nombre} ${turno.profesionalId.apellido}` : 'Sin datos'}</td>
          <td><span class="estado-badge estado-${turno.estado}">${turno.estado}</span></td>
          ${columnaAcciones}
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error cargando tabla de turnos:', error);
  }
}

async function marcarTurnoAtendido(id) {
  if (!confirm('¿Confirmar que el paciente fue atendido en esta sesión?')) return;

  const page = document.querySelector('.turnos-page');
  const rol = page?.dataset.rol || 'profesional';

  try {
    const respuesta = await fetch(`/api/turnos/${id}/atender`, { method: 'PATCH' });
    if (respuesta.ok) {
      await cargarTablaTurnos(rol);
    } else {
      const data = await respuesta.json();
      alert('Error: ' + (data.mensaje || 'No se pudo marcar el turno como atendido'));
    }
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
}

function registrarCobroTurno(turnoId, monto) {
  if (!confirm(`¿Confirmar el cobro de $${monto.toLocaleString('es-AR')} por la consulta particular?`)) return;
  turnosCobrados.add(turnoId);
  const page = document.querySelector('.turnos-page');
  const rol = page?.dataset.rol || 'paciente';
  cargarTablaTurnos(rol);
}

async function cancelarTurnoPaciente(id) {
  if (!confirm('¿Estás seguro de que deseas cancelar este turno? Se reintegrará la sesión a tu cobertura.')) return;

  const page = document.querySelector('.turnos-page');
  const rol = page?.dataset.rol || 'paciente';
  const pacienteId = rol === 'paciente'
    ? page.dataset.pacienteId
    : document.querySelector('#selectPacienteAdmin')?.value;

  try {
    const respuesta = await fetch(`/api/turnos/${id}/cancelar`, { method: 'PATCH' });
    if (respuesta.ok) {
      await actualizarAgendaGlobalProfesionales();
      await cargarTablaTurnos(rol);
      if (pacienteId) await cargarPaquetesPaciente(pacienteId);
      renderizarTarjetasProfesionales();
    } else {
      const data = await respuesta.json();
      alert('Error: ' + (data.mensaje || 'No se pudo cancelar el turno'));
    }
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
}

function formatearFechaConDia(fechaStr) {
  if (!fechaStr) return '';
  const [anio, mes, dia] = fechaStr.split('-').map(Number);
  const fechaObj = new Date(anio, mes - 1, dia);
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const nombreDia = diasSemana[fechaObj.getDay()];
  return `${nombreDia} ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${anio}`;
}