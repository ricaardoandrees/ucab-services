const usuario    = window.usuarioActual;
const rol = usuario?.rol || '';
const subtipo = usuario?.subtipo || '';
const cargo = (usuario?.cargo || '').toLowerCase();
const puedeEditar = ['admin', 'director'].includes(rol) || cargo.includes('secretaria');
const puedeVerGeneral = subtipo === 'PersonalAdministrativo' || puedeEditar;
const ciMiembro  = usuario?.CI;
let beneficiarios    = [];
let tabActual        = 'mis';
let ciInhabActivo    = null;
let ciMiembroActivo  = null;
let ciConstActivo    = null;
let ciMiembroConst   = null;

function toast(msg, tipo = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast toast--${tipo} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

function formatearFecha(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function cargar() {
  document.getElementById('skeleton').style.display = 'block';
  try {
    if (puedeVerGeneral && tabActual === 'todos') {
      beneficiarios = await api.get('/beneficiarios');
      document.getElementById('th-miembro').style.display = '';
    } else {
      beneficiarios = await api.get(`/beneficiarios/${ciMiembro}`);
      document.getElementById('th-miembro').style.display = 'none';
    }
    renderTabla(beneficiarios);
  } catch (err) {
    document.getElementById('skeleton').style.display = 'none';
    document.getElementById('tbody').innerHTML =
      `<tr><td colspan="8" class="empty">Error: ${err.message}</td></tr>`;
  }
}

function renderTabla(lista) {
  document.getElementById('skeleton').style.display = 'none';
  const tbody = document.getElementById('tbody');

  if (!lista || lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty">No hay beneficiarios registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(b => {
    const tipoCarga = b.tipo_carga || (b.centro_educacion_inicial !== undefined ? 'menor' : 'mayor');
    const esMiembroCol = (puedeVerGeneral && tabActual === 'todos')
      ? `<td>${b.nombre_miembro || b.ci_miembro}</td>` : '';

    const badgeEstado = b.estatus_cobertura === 'Habilitado'
      ? `<span class="badge badge--habilitado">Habilitado</span>`
      : `<span class="badge badge--inhabilitado">Pendiente aprobación</span>`;

    const acciones = `
      <div class="acciones">
        ${puedeEditar && b.estatus_cobertura === 'Inhabilitado' ? `
          <button class="btn-icon success" title="Aprobar"
            data-ci="${b.ci}" data-ci-miembro="${b.ci_miembro}" data-action="aprobar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </button>` : ''}
        ${puedeEditar && b.estatus_cobertura === 'Habilitado' ? `
          <button class="btn-icon danger" title="Inhabilitar"
            data-ci="${b.ci}" data-nombre="${b.nombre}" data-ci-miembro="${b.ci_miembro}" data-action="inhabilitar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>` : ''}
        ${puedeEditar && tipoCarga === 'menor' ? `
          <button class="btn-icon" title="Promover a Carga Mayor" style="color: #f59e0b;"
            data-ci="${b.ci}" data-ci-miembro="${b.ci_miembro}" data-action="promover">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
          </button>` : ''}
        ${puedeEditar ? `
          <button class="btn-icon" title="Editar datos"
            data-ci="${b.ci}" data-ci-miembro="${b.ci_miembro}"
            data-tipo="${tipoCarga}"
            data-centro="${b.centro_educacion_inicial || ''}"
            data-vacunacion="${b.esquema_vacunacion || ''}"
            data-constancia="${b.constancia_estudios_uni || ''}"
            data-solteria="${b.certificado_solteria || ''}"
            data-action="editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>` : ''}
      </div>`;

    return `
      <tr>
        <td class="td-ci">${b.ci}</td>
        <td class="td-nombre">${b.nombre}</td>
        ${esMiembroCol}
        <td>${b.parentesco}</td>
        <td><span class="badge badge--${tipoCarga === 'menor' ? 'menor' : 'mayor'}">${tipoCarga === 'menor' ? 'Carga Menor' : 'Carga Mayor'}</span></td>
        <td>${formatearFecha(b.fecha_nacimiento)}</td>
        <td>${badgeEstado}</td>
        <td>${acciones}</td>
      </tr>`;
  }).join('');
}

document.getElementById('tbody').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action     = btn.dataset.action;
  const ci         = btn.dataset.ci;
  const ciM        = btn.dataset['ci-miembro'] || ciMiembro;
  const nombre     = btn.dataset.nombre || '';

  if (action === 'aprobar') {
    try {
      await api.patch(`/beneficiarios/${ciM}/${ci}/aprobar`, {});
      toast('Beneficiario aprobado y habilitado.');
      await cargar();
    } catch (err) { toast(err.message, 'error'); }
  }

  if (action === 'promover') {
    if (!confirm('¿Seguro que deseas promover a este menor a Carga Mayor? Deberán presentar Constancia de Estudios y Certificado de Soltería.')) return;
    try {
      await api.post(`/beneficiarios/${ciM}/${ci}/promover`, {});
      toast('Promovido exitosamente a Carga Mayor.');
      await cargar();
    } catch (err) { toast(err.message, 'error'); }
  }

  if (action === 'inhabilitar') {
    ciInhabActivo   = ci;
    ciMiembroActivo = ciM;
    document.getElementById('inhab-nombre').textContent = nombre;
    document.getElementById('inhab-fecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('modal-inhabilitar').style.display = 'flex';
  }

  if (action === 'constancias') {
    ciConstActivo   = ci;
    ciMiembroConst  = ciM;
    document.getElementById('c-constancia').value = btn.dataset.constancia || '';
    document.getElementById('c-solteria').value   = btn.dataset.solteria   || '';
    document.getElementById('modal-constancias').style.display = 'flex';
  }

  if (action === 'editar') {
    ciConstActivo  = ci;
    ciMiembroConst = ciM;
    const tipo = btn.dataset.tipo;
    if (tipo === 'mayor') {
      document.getElementById('c-constancia').value = btn.dataset.constancia || '';
      document.getElementById('c-solteria').value   = btn.dataset.solteria   || '';
      document.getElementById('modal-constancias').style.display = 'flex';
    } else {
      document.getElementById('m-centro').value     = btn.dataset.centro    || '';
      document.getElementById('m-vacunacion').value = btn.dataset.vacunacion || '';
      document.getElementById('modal-menor').style.display = 'flex';
    }
  }
});

document.getElementById('btn-confirmar-inhab').addEventListener('click', async () => {
  const fecha = document.getElementById('inhab-fecha').value;
  try {
    await api.patch(`/beneficiarios/${ciMiembroActivo}/${ciInhabActivo}/inhabilitar`, { fecha_fin: fecha });
    toast('Vínculo inhabilitado.');
    document.getElementById('modal-inhabilitar').style.display = 'none';
    await cargar();
  } catch (err) { toast(err.message, 'error'); }
});

document.getElementById('btn-guardar-constancias').addEventListener('click', async () => {
  const body = {
    constancia_estudios_uni: document.getElementById('c-constancia').value,
    certificado_solteria:    document.getElementById('c-solteria').value,
  };
  try {
    await api.put(`/beneficiarios/${ciMiembroConst}/${ciConstActivo}/constancias`, body);
    toast('Constancias actualizadas.');
    document.getElementById('modal-constancias').style.display = 'none';
    await cargar();
  } catch (err) { toast(err.message, 'error'); }
});

document.getElementById('b-tipo').addEventListener('change', (e) => {
  document.getElementById('campos-menor').style.display = e.target.value === 'menor' ? 'block' : 'none';
  document.getElementById('campos-mayor').style.display = e.target.value === 'mayor' ? 'block' : 'none';
});

document.getElementById('btn-guardar-nuevo').addEventListener('click', async () => {
  const alertEl = document.getElementById('alert-nuevo');
  alertEl.style.display = 'none';

  const body = {
    CI:               document.getElementById('b-ci').value.trim(),
    Nombre:           document.getElementById('b-nombre').value.trim(),
    Parentesco:       document.getElementById('b-parentesco').value,
    fecha_nacimiento: document.getElementById('b-fecha').value,
    tipo_carga:       document.getElementById('b-tipo').value,
    centro_educacion_inicial: document.getElementById('b-centro').value || null,
    esquema_vacunacion:       document.getElementById('b-vacunacion').value || null,
    constancia_estudios_uni:  document.getElementById('b-constancia').value || null,
    certificado_solteria:     document.getElementById('b-solteria').value || null,
  };

  if (!body.CI || !body.Nombre || !body.Parentesco || !body.fecha_nacimiento || !body.tipo_carga) {
    alertEl.textContent = 'Completa todos los campos obligatorios.';
    alertEl.style.display = 'block';
    return;
  }

  try {
    await api.post(`/beneficiarios/${ciMiembro}`, body);
    document.getElementById('modal-nuevo').style.display = 'none';
    toast('Beneficiario registrado. Pendiente de aprobación.');
    await cargar();
  } catch (err) {
    alertEl.textContent = err.message || 'Error al registrar.';
    alertEl.style.display = 'block';
  }
});

document.getElementById('buscador').addEventListener('input', (e) => {
  const busq = e.target.value.trim().toLowerCase();
  renderTabla(beneficiarios.filter(b =>
    b.nombre.toLowerCase().includes(busq) || b.ci.toLowerCase().includes(busq)
  ));
});

document.getElementById('filtro-estado').addEventListener('change', (e) => {
  const estado = e.target.value;
  renderTabla(estado ? beneficiarios.filter(b => b.estatus_cobertura === estado) : beneficiarios);
});

if (puedeVerGeneral) {
  document.getElementById('tabs-admin').style.display = 'flex';
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      tabActual = tab.dataset.tab;
      cargar();
    });
  });
}

const cerrar = id => document.getElementById(id).style.display = 'none';

document.getElementById('btn-guardar-menor').addEventListener('click', async () => {
  const body = {
    centro_educacion_inicial: document.getElementById('m-centro').value,
    esquema_vacunacion:       document.getElementById('m-vacunacion').value,
  };
  try {
    await api.put(`/beneficiarios/${ciMiembroConst}/${ciConstActivo}/cargamenor`, body);
    toast('Datos actualizados.');
    cerrar('modal-menor');
    await cargar();
  } catch (err) { toast(err.message, 'error'); }
});

document.getElementById('btn-nuevo').addEventListener('click',              () => document.getElementById('modal-nuevo').style.display = 'flex');
document.getElementById('btn-cerrar-nuevo').addEventListener('click',       () => cerrar('modal-nuevo'));
document.getElementById('btn-cancelar-nuevo').addEventListener('click',     () => cerrar('modal-nuevo'));
document.getElementById('btn-cerrar-inhab').addEventListener('click',       () => cerrar('modal-inhabilitar'));
document.getElementById('btn-cancelar-inhab').addEventListener('click',     () => cerrar('modal-inhabilitar'));
document.getElementById('btn-cerrar-constancias').addEventListener('click', () => cerrar('modal-constancias'));
document.getElementById('btn-cancelar-constancias').addEventListener('click',() => cerrar('modal-constancias'));
document.getElementById('btn-cerrar-menor').addEventListener('click',       () => cerrar('modal-menor'));
document.getElementById('btn-cancelar-menor').addEventListener('click',     () => cerrar('modal-menor'));

cargar();