// ===== VEHICULOS (Parse + UI) =====

// --- Parse: guardar / cargar ---
async function guardarCocheEnParse(c) {
  if (!usuarioActual) return;
  const Cls = Parse.Object.extend('CocheUsuario');
  let obj;
  if (c._parseId) {
    obj = new Cls(); obj.id = c._parseId;
  } else {
    obj = new Cls();
    obj.set('usuario', usuarioActual);
    const acl = new Parse.ACL(usuarioActual);
    acl.setPublicReadAccess(false);
    obj.setACL(acl);
  }
  const d = Object.assign({}, c);
  delete d._parseId;
  obj.set('datos', d);
  const saved = await obj.save();
  c._parseId = saved.id;
}

async function eliminarCocheEnParse(c) {
  if (!c._parseId) return;
  const Cls = Parse.Object.extend('CocheUsuario');
  const obj = new Cls(); obj.id = c._parseId;
  await obj.destroy();
}

async function cargarCochesUsuario() {
  if (!usuarioActual) return;
  const Cls = Parse.Object.extend('CocheUsuario');
  const q = new Parse.Query(Cls);
  q.equalTo('usuario', usuarioActual);
  q.limit(1000);
  const res = await q.find();
  coches = res.map(obj => {
    const d = obj.get('datos') || {};
    d._parseId = obj.id;
    return d;
  });
  renderCoches();
  verificarSugerenciasAprobadas();
}

// --- Marcas desde Back4app ---
async function cargarMarcas() {
  const sel = document.getElementById('marca');
  sel.innerHTML = '<option value="">Cargando...</option>';
  try {
    const q = new Parse.Query(Parse.Object.extend('Vehiculo'));
    q.limit(2000); q.ascending('make_name');
    const res = await q.find();
    vehiculosDB = res.map(v => ({
      marca: v.get('make_name'),
      modelo: v.get('model_name'),
      anios: (v.get('years') || '').split('|').filter(Boolean)
    }));
    const marcas = [...new Set(vehiculosDB.map(v => v.marca))].sort();
    sel.innerHTML = '<option value="">-- Selecciona marca --</option>';
    marcas.forEach(m => {
      const o = document.createElement('option');
      o.value = o.textContent = m;
      sel.appendChild(o);
    });
    const oOtro = document.createElement('option');
    oOtro.value = '__otro__'; oOtro.textContent = 'Otra marca...';
    sel.appendChild(oOtro);
  } catch(e) {
    sel.innerHTML = '<option value="">Error al cargar</option>';
  }
}

function actualizarModelos(marca) {
  const selM = document.getElementById('modelo');
  const selA = document.getElementById('anio');
  selM.innerHTML = '<option value="">-- Selecciona modelo --</option>';
  selA.innerHTML = '<option value="">-- Selecciona anio --</option>';
  document.getElementById('modelo-custom').classList.add('oculto');
  if (!marca) return;
  const modelos = [...new Set(vehiculosDB.filter(v => v.marca === marca).map(v => v.modelo))].sort();
  modelos.forEach(m => {
    const o = document.createElement('option');
    o.value = o.textContent = m;
    selM.appendChild(o);
  });
  const oOtro = document.createElement('option');
  oOtro.value = '__otro__'; oOtro.textContent = 'Otro modelo...';
  selM.appendChild(oOtro);
}

function generarAniosCustom() {
  const selA = document.getElementById('anio');
  selA.innerHTML = '<option value="">-- Selecciona anio --</option>';
  Array.from({length:56}, (_, i) => String(2026 - i)).forEach(a => {
    const o = document.createElement('option');
    o.value = o.textContent = a;
    selA.appendChild(o);
  });
}

// --- Sugerencias ---
async function enviarSugerencia(marca, modelo, anio, cocheId) {
  try {
    const Sug = Parse.Object.extend('SugerenciaVehiculo');
    const sug = new Sug();
    sug.set('marca', marca); sug.set('modelo', modelo);
    sug.set('anio', anio);   sug.set('estado', 'pendiente');
    await sug.save();
    const idx = coches.findIndex(c => c.id === cocheId);
    if (idx !== -1) { coches[idx].sugerenciaId = sug.id; guardarCocheEnParse(coches[idx]); }
  } catch(e) { console.warn('No se pudo enviar sugerencia:', e); }
}

async function verificarSugerenciasAprobadas() {
  const pendientes = coches.filter(c => c.esSugerencia && c.sugerenciaId);
  if (!pendientes.length) return;
  try {
    const Sug = Parse.Object.extend('SugerenciaVehiculo');
    const q = new Parse.Query(Sug);
    q.containedIn('objectId', pendientes.map(c => c.sugerenciaId));
    q.equalTo('estado', 'aprobado');
    const aprobadas = await q.find();
    if (!aprobadas.length) return;
    const ids = aprobadas.map(s => s.id);
    let cambio = false;
    coches.forEach(c => {
      if (c.esSugerencia && ids.includes(c.sugerenciaId)) { c.esSugerencia = false; cambio = true; }
    });
    if (cambio) { coches.forEach(c => guardarCocheEnParse(c).catch(() => {})); renderCoches(); }
  } catch(e) { console.warn(e); }
}

// --- Render lista coches ---
function calcularGasto(c) {
  return c.mantenimientos.reduce((s, m) => s + (parseFloat(m.precio) || 0), 0).toFixed(2) + ' €';
}

function renderCoches() {
  const lista = document.getElementById('lista-coches');
  if (!coches.length) {
    lista.innerHTML = '<p style="color:#888;text-align:center;padding:2rem">No tienes coches aun. Anade el primero.</p>';
    return;
  }
  lista.innerHTML = coches.map(c => `
    <div class="coche-card" onclick="abrirCoche(${c.id})">
      <div style="font-size:2rem">🚗</div>
      <div style="flex:1">
        <strong>${c.apodo || c.modelo} ${c.esSugerencia ? '<span class="badge-pendiente">🕒 Pendiente</span>' : ''}</strong><br>
        <small>${c.marca} ${c.modelo} &bull; ${c.anio}</small><br>
        <small>${c.mantenimientos.length} mantenimientos &bull; ${c.referencias.length} referencias &bull; ${calcularGasto(c)}</small>
      </div>
      <div style="font-size:1.4rem;color:#888">&rsaquo;</div>
    </div>
  `).join('');
}

// --- Detalle coche ---
function abrirCoche(id) {
  cocheActualId = id;
  const c = coches.find(c => c.id === id);
  document.getElementById('pagina-coches').classList.add('oculto');
  document.getElementById('pagina-detalle').classList.remove('oculto');
  document.getElementById('detalle-titulo').textContent =
    (c.apodo || c.modelo) + ' - ' + c.marca + ' ' + c.modelo + ' ' + c.anio;
  cargarSelectMotivos();
  renderMantenimientos();
  renderReferencias();
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
  document.querySelector('.tab[data-tab="mantenimientos"]').classList.add('activo');
  document.getElementById('tab-mantenimientos').classList.remove('oculto');
  document.getElementById('tab-referencias').classList.add('oculto');
}

// --- Edicion coche ---
function abrirEdicionCoche() {
  const c = coches.find(c => c.id === cocheActualId);
  if (!c) return;
  document.getElementById('edit-apodo').value  = c.apodo  || '';
  document.getElementById('edit-marca').value  = c.marca  || '';
  document.getElementById('edit-modelo').value = c.modelo || '';
  document.getElementById('edit-anio').value   = c.anio   || '';
  document.getElementById('modal-editar-coche').classList.remove('oculto');
}

async function guardarEdicionCoche() {
  const c = coches.find(c => c.id === cocheActualId);
  if (!c) return;
  c.apodo  = document.getElementById('edit-apodo').value.trim();
  c.marca  = document.getElementById('edit-marca').value.trim()  || c.marca;
  c.modelo = document.getElementById('edit-modelo').value.trim() || c.modelo;
  c.anio   = document.getElementById('edit-anio').value || c.anio;
  await guardarCocheEnParse(c);
  document.getElementById('detalle-titulo').textContent =
    (c.apodo || c.marca + ' ' + c.modelo) + ' (' + c.anio + ')';
  document.getElementById('modal-editar-coche').classList.add('oculto');
  renderCoches();
}
