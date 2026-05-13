// ===== MANTENIMIENTOS =====

function cargarSelectMotivos() {
  const sel = document.getElementById('m-tipo');
  sel.innerHTML = '<option value="">-- Selecciona tipo --</option>';
  getMotivos().forEach(m => {
    const o = document.createElement('option');
    o.value = o.textContent = m;
    sel.appendChild(o);
  });
  const oOtro = document.createElement('option');
  oOtro.value = '__otro__'; oOtro.textContent = 'Otro...';
  sel.appendChild(oOtro);
}

function renderMantenimientos() {
  const c = getCocheById(cocheActualId);
  if (!c) {
    console.warn('renderMantenimientos: cocheActualId no encontrado', cocheActualId);
    return;
  }
  if (!c.mantenimientos) c.mantenimientos = [];
  if (!c.referencias) c.referencias = [];
  const orden = document.getElementById('orden-mantenimientos').value;
  const lista = [...c.mantenimientos].sort((a, b) => {
    if (orden === 'fecha-desc') return new Date(b.fecha) - new Date(a.fecha);
    if (orden === 'fecha-asc')  return new Date(a.fecha) - new Date(b.fecha);
    if (orden === 'km-desc')    return Number(b.km) - Number(a.km);
    if (orden === 'km-asc')     return Number(a.km) - Number(b.km);
    if (orden === 'precio-desc') return (parseFloat(b.precio)||0) - (parseFloat(a.precio)||0);
    if (orden === 'precio-asc')  return (parseFloat(a.precio)||0) - (parseFloat(b.precio)||0);
    if (orden === 'tipo-asc')    return (a.motivo||'').localeCompare(b.motivo||'');
    return 0;
  });
  const total = c.mantenimientos.reduce((s, m) => s + (parseFloat(m.precio) || 0), 0);
  const resumen = document.getElementById('resumen-precio');
  const plan = getPlan();
  resumen.innerHTML = (c.mantenimientos.length && plan.dinero)
    ? `<p style="background:#1a2a1a;padding:0.6rem 1rem;border-radius:8px;color:#4ade80">💰 Total gastado: <strong>${total.toFixed(2)} €</strong> en ${c.mantenimientos.length} registro(s)</p>`
    : '';
  const div = document.getElementById('lista-mantenimientos');
  if (!lista.length) { div.innerHTML = '<p style="color:#888;text-align:center">Sin mantenimientos aun.</p>'; return; }
  div.innerHTML = lista.map(m => `
    <div class="mant-card">
      <div class="mant-header">
        <span class="mant-tipo">${m.motivo || m.tipo || ''}</span>
        <span style="color:#888;font-size:0.85rem">📅 ${m.fecha} &nbsp; 📍 ${Number(m.km).toLocaleString()} km ${m.precio ? ` &nbsp; 💶 ${parseFloat(m.precio).toFixed(2)} €` : ''}</span>
        <div>
          <button class="btn-icon" onclick="abrirEdicionMant('${m.id}')">✏️</button>
          <button class="btn-icon btn-danger" onclick="eliminarMantenimiento('${m.id}')">&#215;</button>
        </div>
      </div>
      ${m.notas ? `<p style="color:#aaa;font-size:0.9rem;margin-top:0.4rem">📝 ${m.notas}</p>` : ''}
      <div style="display:flex;gap:0.5rem;margin-top:0.4rem;flex-wrap:wrap">
        ${m.fotoPieza   ? `<img src="${m.fotoPieza}"   style="max-height:80px;border-radius:6px" alt="Pieza">` : ''}
        ${m.fotoFactura ? `<img src="${m.fotoFactura}" style="max-height:80px;border-radius:6px" alt="Factura">` : ''}
      </div>
    </div>
  `).join('');
}

function eliminarMantenimiento(id) {
  const c = coches.find(c => c.id === cocheActualId);
  if (!c) return;
  if (c.compartido && getPlanKey() !== 'business') {
    return alert('Solo el plan Business puede eliminar mantenimientos en coches compartidos.');
  }
  if (!confirm('Eliminar este registro?')) return;
  c.mantenimientos = c.mantenimientos.filter(m => m.id !== id);
  guardarCocheEnParse(c).catch(() => {});
  renderMantenimientos();
}

// --- Edicion mantenimiento ---
function abrirEdicionMant(mantId) {
  const c = getCocheById(cocheActualId);
  if (!c) return;
  if (c.compartido && getPlanKey() !== 'business') {
    return alert('Solo el plan Business puede editar mantenimientos en coches compartidos.');
  }
  const m = c.mantenimientos.find(m => String(m.id) === String(mantId));
  if (!m) return;
  mantEditId = mantId;
  document.getElementById('edit-mant-fecha').value  = m.fecha  || '';
  document.getElementById('edit-mant-km').value     = m.km     || '';
  document.getElementById('edit-mant-precio').value = m.precio || '';
  document.getElementById('edit-mant-notas').value  = m.notas  || '';
  // Cargar select motivos y preseleccionar
  const sel = document.getElementById('edit-mant-motivo');
  const cus = document.getElementById('edit-mant-motivo-custom');
  sel.innerHTML = '<option value="">-- Selecciona tipo --</option>';
  getMotivos().forEach(mot => {
    const o = document.createElement('option');
    o.value = o.textContent = mot;
    if (mot === m.motivo) o.selected = true;
    sel.appendChild(o);
  });
  const oOtro = document.createElement('option'); oOtro.value = '__otro__'; oOtro.textContent = 'Otro...';
  sel.appendChild(oOtro);
  if (!getMotivos().includes(m.motivo) && m.motivo) {
    sel.value = '__otro__'; cus.classList.remove('oculto'); cus.value = m.motivo;
  } else { cus.classList.add('oculto'); cus.value = ''; }
  sel.onchange = function() {
    if (this.value === '__otro__') { cus.classList.remove('oculto'); cus.required = true; cus.focus(); }
    else { cus.classList.add('oculto'); cus.required = false; cus.value = ''; }
  };
  // Previews fotos
  const pp = document.getElementById('edit-mant-foto-pieza-preview');
  const pf = document.getElementById('edit-mant-foto-factura-preview');
  pp.src = m.fotoPieza   || ''; pp.style.display = m.fotoPieza   ? 'block' : 'none';
  pf.src = m.fotoFactura || ''; pf.style.display = m.fotoFactura ? 'block' : 'none';
  document.getElementById('edit-mant-foto-pieza').value   = '';
  document.getElementById('edit-mant-foto-factura').value = '';
  document.getElementById('modal-editar-mant').classList.remove('oculto');
}

function guardarEdicionMant() {
  const c = getCocheById(cocheActualId);
  if (!c) return;
  if (c.compartido && getPlanKey() !== 'business') {
    return alert('Solo el plan Business puede editar mantenimientos en coches compartidos.');
  }
  const m = c.mantenimientos.find(m => String(m.id) === String(mantEditId));
  if (!m) return;
  m.fecha  = document.getElementById('edit-mant-fecha').value;
  m.km     = document.getElementById('edit-mant-km').value;
  m.precio = parseFloat(document.getElementById('edit-mant-precio').value) || 0;
  m.notas  = document.getElementById('edit-mant-notas').value.trim();
  const sel = document.getElementById('edit-mant-motivo');
  const cus = document.getElementById('edit-mant-motivo-custom').value.trim();
  if (sel.value === '__otro__' && cus) { m.motivo = cus; guardarMotivoCustom(cus); }
  else { m.motivo = sel.value; }
  const fPieza   = document.getElementById('edit-mant-foto-pieza').files[0];
  const fFactura = document.getElementById('edit-mant-foto-factura').files[0];
  function fin() {
    guardarCocheEnParse(c).catch(() => {});
    document.getElementById('modal-editar-mant').classList.add('oculto');
    mantEditId = null;
    renderMantenimientos();
  }
  function leerFact() {
    if (fFactura) { const r = new FileReader(); r.onload = e => { m.fotoFactura = e.target.result; fin(); }; r.readAsDataURL(fFactura); }
    else fin();
  }
  if (fPieza) { const r = new FileReader(); r.onload = e => { m.fotoPieza = e.target.result; leerFact(); }; r.readAsDataURL(fPieza); }
  else leerFact();
}