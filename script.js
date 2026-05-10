// ===== BACK4APP =====
Parse.initialize('VNCETodfuWvUtF1L5O5kcCp3r8JpFpg0GugpBNWz','5wbDOn3d10TBhGPPfEoFgvZp7EDO5TiD2YyssAPv');
Parse.serverURL = 'https://parseapi.back4app.com/';

// ===== ESTADO =====
let vehiculosDB = [];
let coches = [];

// ===== MOTIVOS MANTENIMIENTO =====
const MOTIVOS_DEFAULT = ['Cambio de aceite','Filtro de aire','Filtro de combustible','Pastillas de freno','Discos de freno','Correa de distribuci\u00f3n','Buj\u00edas','Neum\u00e1ticos','Bater\u00eda','ITV','Revisi\u00f3n general'];
function getMotivos() {
  const extras = JSON.parse(localStorage.getItem('motivos_custom')||'[]');
  return [...MOTIVOS_DEFAULT,...extras];
}
function guardarMotivoCustom(m) {
  const extras = JSON.parse(localStorage.getItem('motivos_custom')||'[]');
  if (!extras.includes(m)) { extras.push(m); localStorage.setItem('motivos_custom',JSON.stringify(extras)); }
}
function cargarSelectMotivos() {
  const sel = document.getElementById('m-tipo');
  sel.innerHTML = '<option value="">-- Selecciona tipo --</option>';
  getMotivos().forEach(m => { const o=document.createElement('option'); o.value=o.textContent=m; sel.appendChild(o); });
  const o=document.createElement('option'); o.value='__otro__'; o.textContent='Otro...'; sel.appendChild(o);
}
document.getElementById('m-tipo').addEventListener('change', function() {
  const c = document.getElementById('m-tipo-custom');
  if (this.value==='__otro__') { c.classList.remove('oculto'); c.required=true; c.focus(); }
  else { c.classList.add('oculto'); c.required=false; c.value=''; }
});

// ===== CARGAR MARCAS (BACK4APP) =====
async function cargarMarcas() {
  const sel = document.getElementById('marca');
  sel.innerHTML = '<option value="">Cargando...</option>';
  try {
    const query = new Parse.Query(Parse.Object.extend('Vehiculo'));
    query.limit(2000); query.ascending('make_name');
    const res = await query.find();
    vehiculosDB = res.map(v=>({ marca:v.get('make_name'), modelo:v.get('model_name'), anios:(v.get('years')||'').split('|').filter(Boolean) }));
    const marcas = [...new Set(vehiculosDB.map(v=>v.marca))].sort();
    sel.innerHTML = '<option value="">-- Selecciona marca --</option>';
    marcas.forEach(m=>{ const o=document.createElement('option'); o.value=o.textContent=m; sel.appendChild(o); });
    const o=document.createElement('option'); o.value='__otro__'; o.textContent='Otra marca...'; sel.appendChild(o);
  } catch(e) { sel.innerHTML='<option value="">Error al cargar</option>'; }
}

// Marca: mostrar/ocultar campo custom
document.getElementById('marca').addEventListener('change', function() {
  const mc=document.getElementById('marca-custom');
  const selM=document.getElementById('modelo');
  const selA=document.getElementById('anio');
  if (this.value==='__otro__') {
    mc.classList.remove('oculto'); mc.required=true; mc.focus();
    selM.innerHTML='<option value="">-- Escribe la marca primero --</option>';
    document.getElementById('modelo-custom').classList.add('oculto');
    selA.innerHTML='<option value="">-- Selecciona a\u00f1o --</option>';
    mostrarAvisoSugerencia();
  } else {
    mc.classList.add('oculto'); mc.required=false; mc.value='';
    actualizarModelos(this.value);
    ocultarAvisoSugerencia();
  }
});

// Cuando escribe una marca custom, cargar campo modelo custom
document.getElementById('marca-custom').addEventListener('input', function() {
  const selM=document.getElementById('modelo');
  const mc2=document.getElementById('modelo-custom');
  if (this.value.trim()) {
    selM.innerHTML='<option value="__otro__">Escribe el modelo abajo</option>';
    mc2.classList.remove('oculto'); mc2.required=true;
    generarAniosCustom();
  } else {
    selM.innerHTML='<option value="">-- Escribe la marca primero --</option>';
    mc2.classList.add('oculto'); mc2.required=false;
  }
});

function actualizarModelos(marca) {
  const selM=document.getElementById('modelo');
  const selA=document.getElementById('anio');
  const mc2=document.getElementById('modelo-custom');
  selM.innerHTML='<option value="">-- Selecciona modelo --</option>';
  selA.innerHTML='<option value="">-- Selecciona a\u00f1o --</option>';
  mc2.classList.add('oculto'); mc2.required=false; mc2.value='';
  if (!marca) return;
  const modelos=[...new Set(vehiculosDB.filter(v=>v.marca===marca).map(v=>v.modelo))].sort();
  modelos.forEach(m=>{ const o=document.createElement('option'); o.value=o.textContent=m; selM.appendChild(o); });
  const o=document.createElement('option'); o.value='__otro__'; o.textContent='Otro modelo...'; selM.appendChild(o);
}

// Modelo: mostrar/ocultar campo custom
document.getElementById('modelo').addEventListener('change', function() {
  const mc2=document.getElementById('modelo-custom');
  const selA=document.getElementById('anio');
  if (this.value==='__otro__') {
    mc2.classList.remove('oculto'); mc2.required=true; mc2.focus();
    generarAniosCustom();
    mostrarAvisoSugerencia();
  } else {
    mc2.classList.add('oculto'); mc2.required=false; mc2.value='';
    ocultarAvisoSugerencia();
    if (!this.value) return;
    const marca=document.getElementById('marca').value;
    const v=vehiculosDB.find(v=>v.marca===marca&&v.modelo===this.value);
    const anios=v&&v.anios.length?[...v.anios].sort((a,b)=>b-a):Array.from({length:56},(_,i)=>String(2026-i));
    selA.innerHTML='<option value="">-- Selecciona a\u00f1o --</option>';
    anios.forEach(a=>{ const o=document.createElement('option'); o.value=o.textContent=a; selA.appendChild(o); });
  }
});

function generarAniosCustom() {
  const selA=document.getElementById('anio');
  selA.innerHTML='<option value="">-- Selecciona a\u00f1o --</option>';
  Array.from({length:56},(_,i)=>String(2026-i)).forEach(a=>{ const o=document.createElement('option'); o.value=o.textContent=a; selA.appendChild(o); });
}

function mostrarAvisoSugerencia() { document.getElementById('aviso-sugerencia').classList.remove('oculto'); }
function ocultarAvisoSugerencia() { document.getElementById('aviso-sugerencia').classList.add('oculto'); }

// ===== ENVIAR SUGERENCIA A BACK4APP =====
async function enviarSugerencia(marca, modelo, anio, cocheId) {
  try {
    const Sug = Parse.Object.extend('SugerenciaVehiculo');
    const sug = new Sug();
    sug.set('marca', marca);
    sug.set('modelo', modelo);
    sug.set('anio', anio);
    sug.set('estado', 'pendiente');
    await sug.save();
    // Guardar el sugerenciaId en el coche para poder comprobar su estado despues
    const idx = coches.findIndex(c => c.id === cocheId);
    if (idx !== -1) { coches[idx].sugerenciaId = sug.id; guardarCoches(); }
  } catch(e) { console.warn('No se pudo enviar sugerencia:', e); }
}

// Comprueba si alguna sugerencia pendiente ha sido aprobada y quita el badge
async function verificarSugerenciasAprobadas() {
  const pendientes = coches.filter(c => c.esSugerencia && c.sugerenciaId);
  if (!pendientes.length) return;
  try {
    const Sug = Parse.Object.extend('SugerenciaVehiculo');
    const query = new Parse.Query(Sug);
    query.containedIn('objectId', pendientes.map(c => c.sugerenciaId));
    query.equalTo('estado', 'aprobado');
    const aprobadas = await query.find();
    if (!aprobadas.length) return;
    const idsAprobados = aprobadas.map(s => s.id);
    let cambio = false;
    coches.forEach(c => {
      if (c.esSugerencia && idsAprobados.includes(c.sugerenciaId)) {
        c.esSugerencia = false;
        cambio = true;
      }
    });
    if (cambio) { guardarCoches(); renderCoches(); }
  } catch(e) { console.warn('Error verificando sugerencias:', e); }
}

// ===== MODAL NUEVO COCHE =====
document.getElementById('btn-nuevo-coche').onclick = () => {
  document.getElementById('modal-coche').classList.remove('oculto');
  document.getElementById('aviso-sugerencia').classList.add('oculto');
  cargarMarcas();
};
document.getElementById('cerrar-modal').onclick = () => document.getElementById('modal-coche').classList.add('oculto');
document.getElementById('modal-coche').onclick = function(e) { if(e.target===this) this.classList.add('oculto'); };

document.getElementById('form-coche').addEventListener('submit', function(e) {
  e.preventDefault();
  let marca = document.getElementById('marca').value;
  let modelo = document.getElementById('modelo').value;
  const marcaCustom = document.getElementById('marca-custom').value.trim();
  const modeloCustom = document.getElementById('modelo-custom').value.trim();
  const anio = document.getElementById('anio').value;
  const apodo = document.getElementById('apodo').value;
  let esSugerencia = false;

  if (marca==='__otro__') {
    if (!marcaCustom) { document.getElementById('marca-custom').focus(); return; }
    marca = marcaCustom;
    modelo = modeloCustom || modelo;
    esSugerencia = true;
  } else if (modelo==='__otro__') {
    if (!modeloCustom) { document.getElementById('modelo-custom').focus(); return; }
    modelo = modeloCustom;
    esSugerencia = true;
  }

  if (!marca||!modelo||!anio) return;

  const coche = { id:Date.now(), marca, modelo, anio, apodo, mantenimientos:[], referencias:[], esSugerencia };
  coches.push(coche);
  guardarCoches();
  renderCoches();

  if (esSugerencia) enviarSugerencia(marca, modelo, anio, coche.id);

  document.getElementById('modal-coche').classList.add('oculto');
  this.reset();
  // Limpiar campos custom
  ['marca-custom','modelo-custom'].forEach(id=>{ const el=document.getElementById(id); el.classList.add('oculto'); el.required=false; el.value=''; });
  document.getElementById('aviso-sugerencia').classList.add('oculto');
});

// ===== LISTA DE COCHES =====
function renderCoches() {
  const lista = document.getElementById('lista-coches');
  if (!coches.length) { lista.innerHTML='<p class="vacio">No tienes coches a\u00fan. A\u00f1ade el primero.</p>'; return; }
  lista.innerHTML = coches.map(c=>`
    <div class="coche-card" onclick="abrirCoche(${c.id})">
      <div class="coche-icon">🚗</div>
      <div class="coche-info">
        <div class="coche-nombre">${c.apodo||c.modelo} ${c.esSugerencia?'<span class="badge-sug" title="Marca/modelo pendiente de verificaci\u00f3n">🕒 Pendiente</span>':''}</div>
        <div class="coche-sub">${c.marca} ${c.modelo} &bull; ${c.anio}</div>
        <div class="coche-stats">
          <span>${c.mantenimientos.length} mantenimientos</span>
          <span>${c.referencias.length} referencias</span>
          <span class="coche-gasto">${calcularGasto(c)} gastados</span>
        </div>
      </div>
      <div class="coche-arrow">›</div>
    </div>
  `).join('');
}

function calcularGasto(c) {
  return c.mantenimientos.reduce((s,m)=>s+(parseFloat(m.precio)||0),0).toFixed(2)+' \u20ac';
}

// ===== DETALLE =====
function abrirCoche(id) {
  cocheActualId=id;
  const c=coches.find(c=>c.id===id);
  document.getElementById('pagina-coches').classList.add('oculto');
  document.getElementById('pagina-detalle').classList.remove('oculto');
  document.getElementById('detalle-titulo').textContent=(c.apodo||c.modelo)+' \u2014 '+c.marca+' '+c.modelo+' '+c.anio;
  cargarSelectMotivos();
  renderMantenimientos();
  renderReferencias();
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('activo'));
  document.querySelector('.tab[data-tab="mantenimientos"]').classList.add('activo');
  document.getElementById('tab-mantenimientos').classList.remove('oculto');
  document.getElementById('tab-referencias').classList.add('oculto');
}
document.getElementById('btn-volver').onclick=()=>{
  document.getElementById('pagina-detalle').classList.add('oculto');
  document.getElementById('pagina-coches').classList.remove('oculto');
  cocheActualId=null;
};
document.getElementById('btn-eliminar-coche').onclick=()=>{
  if(!confirm('\u00bfEliminar este coche y todo su historial?')) return;
  coches=coches.filter(c=>c.id!==cocheActualId);
  guardarCoches();
  document.getElementById('btn-volver').click();
};

// ===== TABS =====
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',function(){
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('activo'));
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.add('oculto'));
    this.classList.add('activo');
    document.getElementById('tab-'+this.dataset.tab).classList.remove('oculto');
  });
});

// ===== MANTENIMIENTOS =====
document.getElementById('form-mantenimiento').addEventListener('submit',function(e){
  e.preventDefault();
  const c=coches.find(c=>c.id===cocheActualId);
  let tipo=document.getElementById('m-tipo').value;
  const custom=document.getElementById('m-tipo-custom');
  if(tipo==='__otro__'){
    const nv=custom.value.trim();
    if(!nv){custom.focus();return;}
    guardarMotivoCustom(nv);
    cargarSelectMotivos();
    document.getElementById('m-tipo').value=nv;
    tipo=nv; custom.classList.add('oculto'); custom.required=false; custom.value='';
  }
const nuevoMant = { id:Date.now(), fecha:document.getElementById('m-fecha').value, km:document.getElementById('m-km').value, motivo:tipo, precio:parseFloat(document.getElementById('m-precio').value)||0, notas:document.getElementById('m-notas').value.trim(), fotoPieza:'', fotoFactura:'' };
  const fPieza = document.getElementById('m-foto-pieza').files[0];
  const fFactura = document.getElementById('m-foto-factura').files[0];
  function finAddMant() { c.mantenimientos.push(nuevoMant); guardarCoches(); renderMantenimientos(); this.reset(); cargarSelectMotivos(); }
  function leerFact() { if(fFactura){const r=new FileReader();r.onload=e=>{nuevoMant.fotoFactura=e.target.result;finAddMant.call(frm);};r.readAsDataURL(fFactura);}else{finAddMant.call(frm);}}
  const frm = this;
  if(fPieza){const r=new FileReader();r.onload=e=>{nuevoMant.fotoPieza=e.target.result;leerFact();};r.readAsDataURL(fPieza);}else{leerFact();}
  });
document.getElementById('orden-mantenimientos').addEventListener('change',renderMantenimientos);
function renderMantenimientos(){
  const c=coches.find(c=>c.id===cocheActualId); if(!c) return;
  const orden=document.getElementById('orden-mantenimientos').value;
  const lista=[...c.mantenimientos].sort((a,b)=>{
    if(orden==='fecha-desc') return new Date(b.fecha)-new Date(a.fecha);
    if(orden==='fecha-asc')  return new Date(a.fecha)-new Date(b.fecha);
    if(orden==='km-desc')    return Number(b.km)-Number(a.km);
    if(orden==='km-asc')     return Number(a.km)-Number(b.km);
    if(orden==='precio-desc') return (parseFloat(b.precio)||0)-(parseFloat(a.precio)||0);
    if(orden==='precio-asc')  return (parseFloat(a.precio)||0)-(parseFloat(b.precio)||0);
    if(orden==='tipo-asc')   return a.tipo.localeCompare(b.tipo);
    return 0;
  });
  const total=c.mantenimientos.reduce((s,m)=>s+(parseFloat(m.precio)||0),0);
  document.getElementById('resumen-precio').innerHTML=c.mantenimientos.length?`<span class="badge-total">💰 Total gastado: <strong>${total.toFixed(2)} \u20ac</strong> en ${c.mantenimientos.length} registro(s)</span>`:'';
  const div=document.getElementById('lista-mantenimientos');
  if(!lista.length){div.innerHTML='<p class="vacio">Sin mantenimientos a\u00fan.</p>';return;}
  div.innerHTML=lista.map(m=>`
    <div class="registro">
      <div class="reg-header">
        <span class="reg-tipo">${m.tipo}</span>
        <span class="reg-fecha">📅 ${m.fecha}</span>
        <span class="reg-km">📍 ${Number(m.km).toLocaleString()} km</span>
        ${m.precio?`<span class="reg-precio">💶 ${parseFloat(m.precio).toFixed(2)} \u20ac</span>`:''}
                    <button class="btn-editar" onclick="abrirEdicionMant(${m.id})">✏️</button>
        <button class="btn-eliminar" onclick="eliminarMantenimiento(${m.id})">\u00d7</button>
      </div>
      ${m.notas?`<div class="reg-notas">📝 ${m.notas}</div>`:''}
                  ${m.fotoPieza?`<div class="reg-fotos"><img src="${m.fotoPieza}" class="reg-foto" title="Foto pieza"></div>`:''} ${m.fotoFactura?`<div class="reg-fotos"><img src="${m.fotoFactura}" class="reg-foto" title="Factura"></div>`:''}
    </div>
  `).join('');
}
function eliminarMantenimiento(id){
  if(!confirm('\u00bfEliminar este registro?')) return;
  const c=coches.find(c=>c.id===cocheActualId);
  c.mantenimientos=c.mantenimientos.filter(m=>m.id!==id);
  guardarCoches(); renderMantenimientos();
}

// ===== REFERENCIAS =====
document.getElementById('form-referencia').addEventListener('submit',function(e){
  e.preventDefault();
  const c=coches.find(c=>c.id===cocheActualId);
  const nuevaRef = { id:Date.now(), nombre:document.getElementById('r-nombre').value, codigo:document.getElementById('r-codigo').value, marca:document.getElementById('r-marca').value, notas:document.getElementById('r-notas').value.trim(), fotoPieza:'', fotoFactura:'' };
  const rfPieza = document.getElementById('r-foto-pieza').files[0];
  const rfFactura = document.getElementById('r-foto-factura').files[0];
  const frmR = this;
  function finAddRef() { c.referencias.push(nuevaRef); guardarCoches(); renderReferencias(); frmR.reset(); }
  function leerFactR() { if(rfFactura){const r=new FileReader();r.onload=e=>{nuevaRef.fotoFactura=e.target.result;finAddRef();};r.readAsDataURL(rfFactura);}else{finAddRef();}}
  if(rfPieza){const r=new FileReader();r.onload=e=>{nuevaRef.fotoPieza=e.target.result;leerFactR();};r.readAsDataURL(rfPieza);}else{leerFactR();}
});
function renderReferencias(){
  const c=coches.find(c=>c.id===cocheActualId); if(!c) return;
  const div=document.getElementById('lista-referencias');
  if(!c.referencias.length){div.innerHTML='<p class="vacio">Sin referencias a\u00fan.</p>';return;}
  div.innerHTML=c.referencias.map(r=>`
    <div class="referencia">
      <div class="ref-nombre">${r.nombre}</div>
      <div class="ref-codigo">🔖 ${r.codigo}</div>
      ${r.marca?`<div class="ref-marca">🏾 ${r.marca}</div>`:''}
      ${r.notas?`<div class="ref-notas">📝 ${r.notas}</div>`:''}
            ${r.fotoPieza?`<div class="reg-fotos"><img src="${r.fotoPieza}" class="reg-foto" title="Foto pieza"></div>`:''} ${r.fotoFactura?`<div class="reg-fotos"><img src="${r.fotoFactura}" class="reg-foto" title="Factura"></div>`:''}
          <button class="btn-eliminar" onclick="eliminarReferencia(${r.id})">🗑️</button>
        </div>
  `).join('');
}
function eliminarReferencia(id){
  if(!confirm('\u00bfEliminar esta referencia?')) return;
  const c=coches.find(c=>c.id===cocheActualId);
  c.referencias=c.referencias.filter(r=>r.id!==id);
  guardarCoches(); renderReferencias();
}

// ===== UTILS =====
function guardarCoches(){ localStorage.setItem('coches',JSON.stringify(coches)); }

// ===== EDICION COCHE =====
let mantEditId = null;

function abrirEdicionCoche() {
  const c = coches.find(c => c.id === cocheActualId);
  if (!c) return;
  document.getElementById('edit-apodo').value = c.apodo || '';
  document.getElementById('edit-marca').value = c.marca || '';
  document.getElementById('edit-modelo').value = c.modelo || '';
  document.getElementById('edit-anio').value = c.anio || '';
  document.getElementById('modal-editar-coche').classList.remove('oculto');
}

function guardarEdicionCoche() {
  const c = coches.find(c => c.id === cocheActualId);
  if (!c) return;
  c.apodo = document.getElementById('edit-apodo').value.trim();
  c.marca = document.getElementById('edit-marca').value.trim() || c.marca;
  c.modelo = document.getElementById('edit-modelo').value.trim() || c.modelo;
  c.anio = document.getElementById('edit-anio').value || c.anio;
  guardarCoches();
  document.getElementById('detalle-titulo').textContent = (c.apodo || c.marca + ' ' + c.modelo) + ' (' + c.anio + ')';
  document.getElementById('modal-editar-coche').classList.add('oculto');
  renderCoches();
}

document.getElementById('btn-editar-coche').onclick = abrirEdicionCoche;

// ===== EDICION MANTENIMIENTO =====
function abrirEdicionMant(mantId) {
  const c = coches.find(c => c.id === cocheActualId);
  if (!c) return;
  const m = c.mantenimientos.find(m => m.id === mantId);
  if (!m) return;
  mantEditId = mantId;
document.getElementById('edit-mant-fecha').value = m.fecha || '';
  document.getElementById('edit-mant-km').value = m.km || '';
  // Cargar select de motivos y preseleccionar el actual
  const selEdit = document.getElementById('edit-mant-motivo');
  const customEdit = document.getElementById('edit-mant-motivo-custom');
  selEdit.innerHTML = '<option value="">-- Selecciona tipo --</option>';
  getMotivos().forEach(mot => {
    const o = document.createElement('option');
    o.value = mot; o.textContent = mot;
    if (mot === m.motivo) o.selected = true;
    selEdit.appendChild(o);
  });
  const oOtro = document.createElement('option');
  oOtro.value = '__otro__'; oOtro.textContent = 'Otro...';
  selEdit.appendChild(oOtro);
  const enLista = getMotivos().includes(m.motivo);
  if (!enLista && m.motivo) {
    selEdit.value = '__otro__';
    customEdit.classList.remove('oculto');
    customEdit.value = m.motivo;
  } else {
    customEdit.classList.add('oculto');
    customEdit.value = '';
  }
  selEdit.onchange = function() {
    if (this.value === '__otro__') { customEdit.classList.remove('oculto'); customEdit.required = true; customEdit.focus(); }
    else { customEdit.classList.add('oculto'); customEdit.required = false; customEdit.value = ''; }
  };
  // Fotos guardadas
  const prevPieza = document.getElementById('edit-mant-foto-pieza-preview');
  const prevFact = document.getElementById('edit-mant-foto-factura-preview');
  if (m.fotoPieza) { prevPieza.src = m.fotoPieza; prevPieza.style.display = 'block'; } else { prevPieza.style.display = 'none'; prevPieza.src = ''; }
  if (m.fotoFactura) { prevFact.src = m.fotoFactura; prevFact.style.display = 'block'; } else { prevFact.style.display = 'none'; prevFact.src = ''; }
  document.getElementById('edit-mant-foto-pieza').value = '';
  document.getElementById('edit-mant-foto-factura').value = '';
  document.getElementById('edit-mant-precio').value = m.precio || '';
  document.getElementById('edit-mant-notas').value = m.notas || '';
  document.getElementById('modal-editar-mant').classList.remove('oculto');
  }

function guardarEdicionMant() {
  const c = coches.find(c => c.id === cocheActualId);
  if (!c) return;
  const m = c.mantenimientos.find(m => m.id === mantEditId);
  if (!m) return;
m.fecha = document.getElementById('edit-mant-fecha').value;
  m.km = document.getElementById('edit-mant-km').value;
  const selMot = document.getElementById('edit-mant-motivo');
  const cusVal = document.getElementById('edit-mant-motivo-custom').value.trim();
  if (selMot.value === '__otro__' && cusVal) {
    m.motivo = cusVal;
    guardarMotivoCustom(cusVal);
  } else {
    m.motivo = selMot.value;
  }
  m.precio = parseFloat(document.getElementById('edit-mant-precio').value) || 0;
  m.notas = document.getElementById('edit-mant-notas').value.trim();
  // Guardar imágenes si el usuario eligió archivos nuevos
  const filePieza = document.getElementById('edit-mant-foto-pieza').files[0];
  const fileFactura = document.getElementById('edit-mant-foto-factura').files[0];
  function finalizarGuardado() {
    guardarCoches();
    document.getElementById('modal-editar-mant').classList.add('oculto');
    mantEditId = null;
    renderMantenimientos();
  }
  function leerFactura() {
    if (fileFactura) {
      const r = new FileReader();
      r.onload = e => { m.fotoFactura = e.target.result; finalizarGuardado(); };
      r.readAsDataURL(fileFactura);
    } else { finalizarGuardado(); }
  }
  if (filePieza) {
    const r = new FileReader();
    r.onload = e => { m.fotoPieza = e.target.result; leerFactura(); };
    r.readAsDataURL(filePieza);
  } else { leerFactura(); }
}


// ===== PLANES =====
const PLANES = {
  free:     { coches:1, mantenimientos:15, referencias:20, dinero:false, alarmas:false, enviar:0, recibir:0 },
  basic:    { coches:2, mantenimientos:30, referencias:50, dinero:true,  alarmas:false, enviar:0, recibir:0 },
  normal:   { coches:4, mantenimientos:100,referencias:100,dinero:true,  alarmas:true,  enviar:0, recibir:3 },
  pro:      { coches:8, mantenimientos:300,referencias:300,dinero:true,  alarmas:true,  enviar:8, recibir:10 },
  premium:  { coches:15,mantenimientos:999,referencias:999,dinero:true,  alarmas:true,  enviar:15,recibir:15 },
  business: { coches:999,mantenimientos:9999,referencias:9999,dinero:true,alarmas:true,  enviar:999,recibir:999 }
};

let usuarioActual = null;

// ===== PARSE: GUARDAR / CARGAR COCHES =====
async function guardarCocheIndividual(c) {
  if (!usuarioActual) return;
  const CocheClass = Parse.Object.extend('CocheUsuario');
  let obj;
  if (c._parseId) {
    obj = new CocheClass(); obj.id = c._parseId;
  } else {
    obj = new CocheClass();
    obj.set('usuario', usuarioActual);
    const acl = new Parse.ACL(usuarioActual); acl.setPublicReadAccess(false);
    obj.setACL(acl);
  }
  const d = Object.assign({}, c); delete d._parseId;
  obj.set('datos', d);
  const saved = await obj.save();
  c._parseId = saved.id;
}

async function cargarCochesUsuario() {
  if (!usuarioActual) return;
  const CocheClass = Parse.Object.extend('CocheUsuario');
  const q = new Parse.Query(CocheClass);
  q.equalTo('usuario', usuarioActual);
  q.limit(1000);
  const res = await q.find();
  coches = res.map(obj => { const d = obj.get('datos') || {}; d._parseId = obj.id; return d; });
  renderCoches();
  verificarSugerenciasAprobadas();
}

// ===== AUTH =====
function mostrarTab(tab) {
  const fLogin = document.getElementById('form-login');
  const fReg = document.getElementById('form-registro');
  if (!fLogin || !fReg) return;
  if (tab === 'registro') {
    fLogin.classList.add('oculto');
    fReg.classList.remove('oculto');
  } else {
    fLogin.classList.remove('oculto');
    fReg.classList.add('oculto');
  }
}

function _mostrarAuth() {
  document.getElementById('pagina-auth').classList.remove('oculto');
  const h = document.querySelector('header');
  const pc = document.getElementById('pagina-coches');
  const pd = document.getElementById('pagina-detalle');
  if (h) h.classList.add('oculto');
  if (pc) pc.classList.add('oculto');
  if (pd) pd.classList.add('oculto');
  mostrarTab('login');
}

function _mostrarApp(user) {
  usuarioActual = user;
  document.getElementById('pagina-auth').classList.add('oculto');
  const h = document.querySelector('header');
  const pc = document.getElementById('pagina-coches');
  if (h) h.classList.remove('oculto');
  if (pc) pc.classList.remove('oculto');
  const apodo = user.get('apodo') || user.get('username') || user.get('email');
  const plan = user.get('plan') || 'free';
  const el = document.getElementById('header-apodo');
  if (el) el.textContent = apodo + ' (★ ' + plan.toUpperCase() + ')';
  cargarMarcas();
  cargarCochesUsuario();
}

async function loginUsuario(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  err.textContent = ''; err.classList.add('oculto');
  try {
    const user = await Parse.User.logIn(email, pass);
    _mostrarApp(user);
  } catch(ex) {
    err.textContent = 'Email o contraseña incorrectos: ' + (ex.message || '');
    err.classList.remove('oculto');
  }
}

async function registrarUsuario(event) {
  event.preventDefault();
  const apodo = document.getElementById('reg-apodo').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const err = document.getElementById('reg-error');
  err.textContent = ''; err.classList.add('oculto');
  try {
    const u = new Parse.User();
    u.set('username', email); u.set('password', pass);
    u.set('email', email); u.set('apodo', apodo); u.set('plan', 'free');
    await u.signUp();
    _mostrarApp(u);
  } catch(ex) {
    err.textContent = ex.message || 'Error al registrarse.';
    err.classList.remove('oculto');
  }
}

function cerrarSesion() {
  Parse.User.logOut().then(() => { usuarioActual = null; coches = []; _mostrarAuth(); });
}

// ===== INICIO =====
document.addEventListener('DOMContentLoaded', function() {
  const user = Parse.User.current();
  if (user) { _mostrarApp(user); } else { _mostrarAuth(); }
});
