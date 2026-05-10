=== MANTENIMIENTOS (Parse + UI) =====

// Parse: añadir mantenimiento
function añadirMantenimientoEnParse(cocheId, tipo, fecha, km, coste, detalles, refs, motivo) {
  const Coche = Parse.Object.extend('CocheUsuario');
  const q = new Parse.Query(Coche);
  q.equalTo('objectId', cocheId);
  return q.first().then(obj => {
    let ms = obj.get('mantenimientos') || [];
    ms.push({ tipo, fecha, km, coste, detalles, referencias: refs, motivo });
    obj.set('mantenimientos', ms);
    return obj.save();
  });
}

// Parse: actualizar mantenimiento
function actualizarMantenimientoEnParse(cocheId, idx, tipo, fecha, km, coste, detalles, refs, motivo) {
  const Coche = Parse.Object.extend('CocheUsuario');
  const q = new Parse.Query(Coche);
  q.equalTo('objectId', cocheId);
  return q.first().then(obj => {
    let ms = obj.get('mantenimientos') || [];
    ms[idx] = { tipo, fecha, km, coste, detalles, referencias: refs, motivo };
    obj.set('mantenimientos', ms);
    return obj.save();
  });
}

// Parse: eliminar mantenimiento
function eliminarMantenimientoEnParse(cocheId, idx) {
  const Coche = Parse.Object.extend('CocheUsuario');
  const q = new Parse.Query(Coche);
  q.equalTo('objectId', cocheId);
  return q.first().then(obj => {
    let ms = obj.get('mantenimientos') || [];
    ms.splice(idx, 1);
    obj.set('mantenimientos', ms);
    return obj.save();
  });
}

// UI: crear lista de motivos con "Otro..."
function crearSelectMotivo(idSel, valorActual) {
  const s = document.getElementById(idSel);
  s.innerHTML = '';
  motivosLista.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.text = m;
    if (m === valorActual) opt.selected = true;
    s.appendChild(opt);
  });
  const otro = document.createElement('option');
  otro.value = 'Otro...';
  otro.text = 'Otro...';
  if (valorActual && !motivosLista.includes(valorActual)) {
    otro.selected = true;
  }
  s.appendChild(otro);
}

// UI: render mantenimientos
function renderMantenimientos() {
  const mList = document.getElementById('lista-mantenimientos');
  mList.innerHTML = '';
  if (!cocheActual) return;
  const ms = cocheActual.mantenimientos || [];
  ms.forEach((m, i) => {
    const div = document.createElement('div');
    div.className = 'mantenimiento-item';
    div.innerHTML = `
      <div class="mant-header">
        <strong>${m.motivo || m.tipo || '(sin motivo)'}</strong> - ${m.fecha || ''}
      </div>
      <div class="mant-body">
        Km: ${m.km || 0} | Coste: ${m.coste || 0}€<br>
        ${m.detalles || ''}<br>
        ${(m.referencias || []).length} referencia(s)
      </div>
      <button onclick="editarMantenimiento(${i})">Editar</button>
      <button onclick="eliminarMantenimiento(${i})">Eliminar</button>
    `;
    mList.appendChild(div);
  });
}

// UI: editar mantenimiento
window.editarMantenimiento = function(idx) {
  const m = cocheActual.mantenimientos[idx];
  document.getElementById('edit-mant-idx').value = idx;
  document.getElementById('edit-mant-km').value = m.km || '';
  document.getElementById('edit-mant-fecha').value = m.fecha || '';
  document.getElementById('edit-mant-coste').value = m.coste || '';
  document.getElementById('edit-mant-detalles').value = m.detalles || '';
  crearSelectMotivo('edit-mant-tipo', m.motivo || m.tipo);
  const modal = document.getElementById('modal-editar-mant');
  modal.style.display = 'flex';
};

// UI: eliminar mantenimiento
window.eliminarMantenimiento = function(idx) {
  if (!confirm('¿Eliminar este mantenimiento?')) return;
  eliminarMantenimientoEnParse(cocheActual.id, idx).then(() => {
    cargarCochesUsuario();
  });
};
