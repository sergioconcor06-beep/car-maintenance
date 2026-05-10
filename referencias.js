=== REFERENCIAS (Parse + UI) =====

// Parse: añadir referencia
function añadirReferenciaEnParse(cocheId, mantIdx, desc, precio, detalle) {
  const Coche = Parse.Object.extend('CocheUsuario');
  const q = new Parse.Query(Coche);
  q.equalTo('objectId', cocheId);
  return q.first().then(obj => {
    let ms = obj.get('mantenimientos') || [];
    if (!ms[mantIdx].referencias) ms[mantIdx].referencias = [];
    ms[mantIdx].referencias.push({ descripcion: desc, precio, detalle });
    obj.set('mantenimientos', ms);
    return obj.save();
  });
}

// Parse: eliminar referencia
function eliminarReferenciaEnParse(cocheId, mantIdx, refIdx) {
  const Coche = Parse.Object.extend('CocheUsuario');
  const q = new Parse.Query(Coche);
  q.equalTo('objectId', cocheId);
  return q.first().then(obj => {
    let ms = obj.get('mantenimientos') || [];
    if (ms[mantIdx].referencias) {
      ms[mantIdx].referencias.splice(refIdx, 1);
    }
    obj.set('mantenimientos', ms);
    return obj.save();
  });
}

// UI: render referencias
function renderReferencias() {
  const rList = document.getElementById('lista-referencias');
  rList.innerHTML = '';
  if (!cocheActual || mantActualIdx === null) return;
  const ms = cocheActual.mantenimientos || [];
  const mant = ms[mantActualIdx];
  if (!mant) return;
  const refs = mant.referencias || [];
  refs.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'referencia-item';
    div.innerHTML = `
      <div><strong>${r.descripcion || '(sin desc)'}</strong> - ${r.precio || 0}€</div>
      <div>${r.detalle || ''}</div>
      <button onclick="eliminarReferencia(${i})">Eliminar</button>
    `;
    rList.appendChild(div);
  });
}

// UI: eliminar referencia
window.eliminarReferencia = function(refIdx) {
  if (!confirm('¿Eliminar esta referencia?')) return;
  eliminarReferenciaEnParse(cocheActual.id, mantActualIdx, refIdx).then(() => {
    cargarCochesUsuario();
  });
};
