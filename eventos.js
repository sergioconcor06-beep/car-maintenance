// ===== EVENTOS DOM =====
// IDs correctos segun index.html:
// modal coche: modal-coche | form coche: form-coche | cerrar: cerrar-modal
// btn header añadir: btn-nuevo-coche | btn mi plan: btn-mi-plan (onclick inline)
// form mantenimiento: form-mantenimiento | form referencia: form-referencia
// modal editar coche: modal-editar-coche | modal editar mant: modal-editar-mant

document.addEventListener('DOMContentLoaded', function() {

  // --- Marca select ---
  document.getElementById('marca').addEventListener('change', function() {
    const mc   = document.getElementById('marca-custom');
    const selM = document.getElementById('modelo');
    const selA = document.getElementById('anio');
    if (this.value === '__otro__') {
      mc.classList.remove('oculto'); mc.required = true; mc.focus();
      selM.innerHTML = '<option value="__otro__">Escribe la marca primero</option>';
      document.getElementById('modelo-custom').classList.add('oculto');
      selA.innerHTML = '<option value="">-- Selecciona anio --</option>';
      document.getElementById('aviso-sugerencia').classList.remove('oculto');
    } else {
      mc.classList.add('oculto'); mc.required = false; mc.value = '';
      actualizarModelos(this.value);
      document.getElementById('aviso-sugerencia').classList.add('oculto');
    }
  });

  document.getElementById('marca-custom').addEventListener('input', function() {
    const selM = document.getElementById('modelo');
    const mc2  = document.getElementById('modelo-custom');
    if (this.value.trim()) {
      selM.innerHTML = '<option value="__otro__">Escribe el modelo abajo</option>';
      mc2.classList.remove('oculto'); mc2.required = true;
      generarAniosCustom();
    } else {
      selM.innerHTML = '<option value="">-- Escribe la marca primero --</option>';
      mc2.classList.add('oculto'); mc2.required = false;
    }
  });

  // --- Modelo select ---
  document.getElementById('modelo').addEventListener('change', function() {
    const selA = document.getElementById('anio');
    const mc2  = document.getElementById('modelo-custom');
    if (this.value === '__otro__') {
      mc2.classList.remove('oculto'); mc2.required = true; mc2.focus();
      selA.innerHTML = '<option value="">-- Selecciona anio --</option>';
      document.getElementById('aviso-sugerencia').classList.remove('oculto');
    } else {
      mc2.classList.add('oculto'); mc2.required = false; mc2.value = '';
      document.getElementById('aviso-sugerencia').classList.add('oculto');
      if (this.value) {
        const marca   = document.getElementById('marca').value;
        const entrada = vehiculosDB.filter(v => v.marca === marca && v.modelo === this.value);
        const aniosSet = new Set();
        entrada.forEach(v => v.anios.forEach(a => aniosSet.add(a)));
        selA.innerHTML = '<option value="">-- Selecciona anio --</option>';
        [...aniosSet].sort((a,b) => b - a).forEach(a => {
          const o = document.createElement('option');
          o.value = o.textContent = a;
          selA.appendChild(o);
        });
      }
    }
  });

  // --- Form anadir coche (id=form-coche) ---
  document.getElementById('form-coche').addEventListener('submit', function(e) {
    e.preventDefault();
    const marcaVal    = document.getElementById('marca').value;
    const marcaCustom = document.getElementById('marca-custom').value.trim();
    const modeloVal   = document.getElementById('modelo').value;
    const modeloCustom = document.getElementById('modelo-custom').value.trim();
    const anioVal     = document.getElementById('anio').value;
    const apodoVal    = document.getElementById('apodo').value.trim();

    const marcaFinal  = (marcaVal === '__otro__')  ? marcaCustom  : marcaVal;
    const modeloFinal = (modeloVal === '__otro__') ? modeloCustom : modeloVal;

    if (!marcaFinal || !modeloFinal) return alert('Marca y modelo son obligatorios');

    const esSugerencia = (marcaVal === '__otro__' || modeloVal === '__otro__');
    const id = Date.now().toString();
    const c = {
      id, marca: marcaFinal, modelo: modeloFinal,
      anio: anioVal || '', apodo: apodoVal,
      mantenimientos: [], referencias: [], esSugerencia
    };

    guardarCocheEnParse(c).then(() => {
      if (esSugerencia) enviarSugerencia(marcaFinal, modeloFinal, anioVal, id);
      cargarCochesUsuario();
      document.getElementById('modal-coche').classList.add('oculto');
      e.target.reset();
      document.getElementById('modelo-custom').classList.add('oculto');
      document.getElementById('marca-custom').classList.add('oculto');
      document.getElementById('aviso-sugerencia').classList.add('oculto');
    });
  });

  // --- Botón Añadir Coche en header (id=btn-nuevo-coche) ---
  document.getElementById('btn-nuevo-coche').addEventListener('click', function() {
    document.getElementById('modal-coche').classList.remove('oculto');
  });

  // --- Volver de detalle a listado ---
  const btnVolver = document.getElementById('btn-volver');
  if (btnVolver) {
    btnVolver.addEventListener('click', function() {
      document.getElementById('pagina-detalle').classList.add('oculto');
      document.getElementById('pagina-coches').classList.remove('oculto');
    });
  }

  // --- Botones editar / eliminar coche en detalle ---
  const btnEditarCoche = document.getElementById('btn-editar-coche');
  if (btnEditarCoche) {
    btnEditarCoche.addEventListener('click', function() {
      if (!cocheActualId) return alert('Selecciona un coche primero');
      abrirEdicionCoche();
    });
  }
  const btnEliminarCoche = document.getElementById('btn-eliminar-coche');
  if (btnEliminarCoche) {
    btnEliminarCoche.addEventListener('click', function() {
      if (!cocheActualId) return alert('Selecciona un coche primero');
      const c = getCocheById(cocheActualId);
      if (!c) return alert('Coche no encontrado');
      if (!confirm('Eliminar este coche?')) return;
      eliminarCocheEnParse(c).then(() => {
        coches = coches.filter(cc => String(cc.id) !== String(cocheActualId));
        cargarCochesUsuario();
        document.getElementById('pagina-detalle').classList.add('oculto');
        document.getElementById('pagina-coches').classList.remove('oculto');
        cocheActualId = null;
      }).catch(e => alert('Error al eliminar: ' + (e.message || e)));
    });
  }

  // --- Cerrar modal coche (id=cerrar-modal) ---
  document.getElementById('cerrar-modal').addEventListener('click', function() {
    document.getElementById('modal-coche').classList.add('oculto');
    document.getElementById('form-coche').reset();
    document.getElementById('modelo-custom').classList.add('oculto');
    document.getElementById('marca-custom').classList.add('oculto');
    document.getElementById('aviso-sugerencia').classList.add('oculto');
  });

  // --- Form mantenimiento ---
  document.getElementById('form-mantenimiento').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!cocheActualId) return alert('Selecciona un coche primero');
    const fecha  = document.getElementById('m-fecha').value;
    const km     = document.getElementById('m-km').value;
    const precio = document.getElementById('m-precio').value;
    const notas  = document.getElementById('m-notas').value.trim();
    const selTipo    = document.getElementById('m-tipo');
    const tipoCustom = document.getElementById('m-tipo-custom').value.trim();
    const motivo = (selTipo && selTipo.value === 'Otro...') ? tipoCustom
               : (selTipo && selTipo.value)              ? selTipo.value
               : tipoCustom;
    if (!motivo) return alert('Indica el motivo/tipo del mantenimiento');

    const procesarFoto = file => new Promise(resolve => {
      if (!file) return resolve(null);
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(file);
    });
    const p1 = document.getElementById('m-foto-pieza').files[0];
    const p2 = document.getElementById('m-foto-factura').files[0];

    Promise.all([procesarFoto(p1), procesarFoto(p2)]).then(([fotoPieza, fotoFactura]) => {
      const c = getCocheById(cocheActualId);
      if (!c) return;
      if (c.compartido && getPlanKey() !== 'business') {
        return alert('Solo el plan Business puede añadir mantenimientos a coches compartidos.');
      }
      c.mantenimientos = c.mantenimientos || [];
      const m = { id: Date.now().toString(), motivo, fecha, km: parseInt(km)||0, precio: parseFloat(precio)||0, notas, fotoPieza, fotoFactura };
      c.mantenimientos.push(m);
      guardarCocheEnParse(c).then(() => { cargarCochesUsuario(); e.target.reset(); });
    });
  });

  // --- Form referencia ---
  document.getElementById('form-referencia').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!cocheActualId) return alert('Selecciona un coche primero');
    const nombre = document.getElementById('r-nombre').value.trim();
    const codigo = document.getElementById('r-codigo').value.trim();
    const marca  = document.getElementById('r-marca').value.trim();
    const notas  = document.getElementById('r-notas').value.trim();
    const procesarFoto = file => new Promise(resolve => {
      if (!file) return resolve(null);
      const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(file);
    });
    const p1 = document.getElementById('r-foto-pieza').files[0];
    const p2 = document.getElementById('r-foto-factura').files[0];
    Promise.all([procesarFoto(p1), procesarFoto(p2)]).then(([fotoPieza, fotoFactura]) => {
      const c = getCocheById(cocheActualId);
      if (!c) return;
      c.referencias = c.referencias || [];
      const r = { id: Date.now().toString(), nombre, codigo, marca, notas, fotoPieza, fotoFactura };
      c.referencias.push(r);
      guardarCocheEnParse(c).then(() => { cargarCochesUsuario(); e.target.reset(); });
    });
  });

  // --- Tabs de detalle ---
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
      this.classList.add('activo');
      const target = this.dataset.tab;
      document.getElementById('tab-mantenimientos').classList.toggle('oculto', target !== 'mantenimientos');
      document.getElementById('tab-referencias').classList.toggle('oculto',    target !== 'referencias');
      document.getElementById('tab-alarmas').classList.toggle('oculto',      target !== 'alarmas');
      if (target === 'alarmas') renderAlarmas();
    });
  });

  // --- Orden mantenimientos ---
  document.getElementById('orden-mantenimientos').addEventListener('change', function() {
    renderMantenimientos(this.value);
  });

  // --- Boton Mi Plan (btn-mi-plan ya tiene onclick inline, pero por seguridad tb aqui) ---
  const btnPlan = document.getElementById('btn-mi-plan');
  if (btnPlan) btnPlan.addEventListener('click', function() {
    abrirModalPlanes();
  });

  // --- Boton Transferir coche en detalle ---
  const btnTransferirCoche = document.getElementById('btn-transferir-coche');
  if (btnTransferirCoche) btnTransferirCoche.addEventListener('click', function() {
    abrirModalTransferencia();
  });

  // --- Select motivo mantenimiento (mostrar campo custom) ---
  const selMotivo = document.getElementById('m-tipo');
  if (selMotivo) {
    selMotivo.addEventListener('change', function() {
      const custom = document.getElementById('m-tipo-custom');
      if (this.value === '__otro__' || this.value === 'Otro...') {
        custom.classList.remove('oculto'); custom.required = true; custom.focus();
      } else {
        custom.classList.add('oculto'); custom.required = false; custom.value = '';
      }
    });
  }

  // --- Select motivo edicion mantenimiento ---
  const selMotivoEdit = document.getElementById('edit-mant-motivo');
  if (selMotivoEdit) {
    selMotivoEdit.addEventListener('change', function() {
      const custom = document.getElementById('edit-mant-motivo-custom');
      if (this.value === '__otro__' || this.value === 'Otro...') {
        custom.classList.remove('oculto'); custom.required = true;
      } else {
        custom.classList.add('oculto'); custom.required = false; custom.value = '';
      }
    });
  }

  iniciarAlarmasListeners();
}); // fin DOMContentLoaded

// ===== PLANES: descripcion de ventajas =====
const PLANES_INFO = {
  free:     { nombre: 'Free',     emoji: '🆓', color: '#888',    coches: 1,   mantenimientos: 15,  referencias: 20,  dinero: false, alarmas: false, enviar: 0,   recibir: 0,    precioMensual: 0,     precioAnual: 0    },
  basic:    { nombre: 'Basic',    emoji: '🔵', color: '#4a90d9', coches: 2,   mantenimientos: 30,  referencias: 50,  dinero: true,  alarmas: false, enviar: 0,   recibir: 0,    precioMensual: 2.5,   precioAnual: 24.00 },
  normal:   { nombre: 'Normal',   emoji: '🟢', color: '#27ae60', coches: 4,   mantenimientos: 100, referencias: 100, dinero: true,  alarmas: true,  enviar: 0,   recibir: 3,    precioMensual: 4.99,  precioAnual: 47.92 },
  pro:      { nombre: 'Pro',      emoji: '🟡', color: '#f39c12', coches: 8,   mantenimientos: 300, referencias: 300, dinero: true,  alarmas: true,  enviar: 8,   recibir: 10,   precioMensual: 14.99, precioAnual: 143.90 },
  premium:  { nombre: 'Premium',  emoji: '🟠', color: '#e67e22', coches: 15,  mantenimientos: 650, referencias: 650, dinero: true,  alarmas: true,  enviar: 15,  recibir: 15,   precioMensual: 24.99, precioAnual: 239.90 },
  business: { nombre: 'Business', emoji: '💎', color: '#8e44ad', coches: 999999, mantenimientos: 999999,referencias: 999999,dinero: true,  alarmas: true,  enviar: 999999, recibir: 999999, precioMensual: 249.99, precioAnual: 2400 }
};

function _ventajasHtml(planKey) {
  const p = PLANES_INFO[planKey];
  if (!p) return '';
  const si = (txt) => `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f0fff4;border-radius:8px;"><span style="font-size:1.1rem;">✅</span><span style="color:#1a7a3c;">${txt}</span></div>`;
  const no = (txt) => `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#fff5f5;border-radius:8px;"><span style="font-size:1.1rem;">❌</span><span style="color:#a00;">${txt}</span></div>`;
  let items = [];
  items.push(si(`Hasta ${p.coches === 999999 ? 'ilimitados' : p.coches} coche${p.coches === 1 ? '' : 's'}`) );
  items.push(si(`Hasta ${p.mantenimientos === 999999 ? 'ilimitados' : p.mantenimientos} mantenimientos por coche`));
  items.push(si(`Hasta ${p.referencias === 999999 ? 'ilimitadas' : p.referencias} referencias por coche`));
  items.push(p.dinero   ? si('Ver gasto total en dinero')         : no('Sin gasto total en dinero'));
  items.push(p.alarmas  ? si('Acceso a alarmas y recordatorios')   : no('Sin acceso a alarmas'));
  if (p.enviar === 0)   items.push(no('No puede compartir coches'));
  else                  items.push(si(`Compartir coches (hasta ${p.enviar === 999999 ? 'ilimitados' : p.enviar})`));
  if (p.recibir === 0)  items.push(no('No puede recibir coches compartidos'));
  else                  items.push(si(`Recibir coches compartidos (hasta ${p.recibir === 999999 ? 'ilimitados' : p.recibir})`));
  return items.join('');
}

function _tarjetaPlan(planKey, planActual) {
  const p = PLANES_INFO[planKey];
  const esActual = planKey === planActual;
  const borde = esActual ? `border:2px solid ${p.color};` : 'border:2px solid #e0e0e0;';
  return `
    <div style="${borde}border-radius:12px;padding:14px 12px;text-align:center;background:${esActual ? '#f8f9ff' : '#fff'};">
      <div style="font-size:1.6rem;">${p.emoji}</div>
      <div style="font-weight:700;color:${p.color};font-size:1rem;margin:4px 0;">${p.nombre}</div>      <div style="font-size:0.9rem;color:#444;margin-bottom:8px;">
        ${p.precioMensual === 0 ? 'Gratis' : `€${p.precioMensual.toFixed(2)} / mes`} •
        ${p.precioAnual === 0 ? 'Gratis' : `€${p.precioAnual.toFixed(2)} / año`}
      </div>      ${esActual ? '<div style="font-size:0.72rem;background:#4a90d9;color:#fff;border-radius:10px;padding:2px 8px;margin-bottom:6px;display:inline-block;">Tu plan</div>' : ''}
      <ul style="text-align:left;font-size:0.78rem;padding-left:14px;margin:8px 0 0 0;color:#444;line-height:1.6;">
        <li>${p.coches === 999999 ? 'Coches ilimitados' : p.coches + ' coche' + (p.coches === 1 ? '' : 's')}</li>
        <li>${p.mantenimientos === 999999 ? 'Mant. ilimitados' : p.mantenimientos + ' mantenimientos'}</li>
        <li>${p.referencias === 999999 ? 'Refs. ilimitadas' : p.referencias + ' referencias'}</li>
        <li>${p.dinero ? '✅ Gasto total' : '❌ Sin gasto total'}</li>
        <li>${p.alarmas ? '✅ Alarmas' : '❌ Sin alarmas'}</li>
        <li>${p.enviar === 0 ? '❌ No comparte' : '✅ Comparte coches'}</li>
        <li>${p.recibir === 0 ? '❌ No recibe' : '✅ Recibe coches'}</li>
      </ul>
    </div>`;
}

function cerrarTodosLosModales() {
  document.querySelectorAll('.modal-overlay').forEach(function(modal) {
    modal.classList.add('oculto');
  });
}
window.cerrarTodosLosModales = cerrarTodosLosModales;

function abrirModalPlanes() {
  console.log('[App] abrirModalPlanes invoked');
  cerrarTodosLosModales();
  document.getElementById('modal-planes').classList.remove('oculto');
  mostrarVistaMiPlan();
}
window.abrirModalPlanes = abrirModalPlanes;

function mostrarVistaMiPlan() {
  document.getElementById('vista-mi-plan').classList.remove('oculto');
  document.getElementById('vista-mejorar-plan').classList.add('oculto');
  const user = Parse.User.current();
  const planKey = (user ? user.get('plan') : null) || 'free';
  const info = PLANES_INFO[planKey] || PLANES_INFO['free'];
  document.getElementById('planes-nombre-actual').innerHTML =
    `<span style="background:${info.color};color:#fff;padding:4px 16px;border-radius:20px;">${info.emoji} ${info.nombre}</span>`;
  document.getElementById('planes-ventajas-lista').innerHTML = _ventajasHtml(planKey);
  actualizarPlanActions();
}
window.mostrarVistaMiPlan = mostrarVistaMiPlan;

function mostrarVistaMejorar() {
  document.getElementById('vista-mi-plan').classList.add('oculto');
  document.getElementById('vista-mejorar-plan').classList.remove('oculto');
  const user = Parse.User.current();
  const planActual = (user ? user.get('plan') : null) || 'free';
  const grid = document.getElementById('todos-planes-grid');
  grid.innerHTML = Object.keys(PLANES_INFO).map(k => _tarjetaPlan(k, planActual)).join('');
}
window.mostrarVistaMejorar = mostrarVistaMejorar;

function actualizarPlanActions() {
  const cont = document.getElementById('planes-acciones');
  if (!cont) return;
  const user = Parse.User.current();
  const planKey = (user ? user.get('plan') : null) || 'free';
  cont.innerHTML = '';
  if (planKey === 'free') {
    const aviso = document.createElement('div');
    aviso.className = 'aviso-info';
    aviso.textContent = isEmailVerified()
      ? 'Tu correo está verificado. Inicia la prueba gratuita de Normal durante 30 días.'
      : 'Verifica tu correo para acceder a 1 mes de prueba gratuita de Normal.';
    const boton = document.createElement('button');
    boton.className = 'btn-primary';
    boton.style.minWidth = '160px';
    boton.textContent = 'Iniciar prueba Normal';
    boton.disabled = !isEmailVerified();
    boton.onclick = iniciarPruebaNormal;
    cont.appendChild(aviso);
    cont.appendChild(boton);
  } else if (isTrialActive()) {
    const aviso = document.createElement('div');
    aviso.className = 'aviso-info';
    aviso.textContent = `Prueba activa: ${trialDaysRemaining()} día(s) restantes.`;
    cont.appendChild(aviso);
  }
}

async function iniciarPruebaNormal() {
  const user = Parse.User.current();
  if (!user) return;
  if (!isEmailVerified()) {
    // Enviar email de verificación
    try {
      const response = await fetch('http://localhost:3000/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.get('email') })
      });
      const data = await response.json();
      if (data.success) {
        alert('Se ha enviado un email de verificación a tu correo. Verifícalo para continuar con la prueba gratuita.');
      } else {
        alert('Error enviando email: ' + data.error);
        return;
      }
    } catch (e) {
      alert('Error enviando email: ' + e.message);
      return;
    }
    return;
  }
  const ahora = new Date();
  const finPrueba = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
  user.set('plan', 'normal');
  user.set('trialStart', ahora.toISOString());
  user.set('trialEnd', finPrueba.toISOString());
  try {
    await user.save();
    mostrarVistaMiPlan();
    _mostrarApp(user);
    alert('Tu prueba gratuita de Normal ha comenzado. Dura 30 días.');
  } catch(e) {
    alert('Error al iniciar la prueba: ' + (e.message || e));
  }
}

function renderAlarmasResumen() {
  const panel = document.getElementById('alarmas-panel');
  if (!panel) return;
  if (!userHasAlarmas()) {
    panel.style.display = 'block';
    panel.innerHTML = `
      <h3>Alarmas</h3>
      <p class="vacio">Tu plan actual no ofrece recordatorios. Mejora para activar alarmas de ITV, aceite y avisos personalizados.</p>
    `;
    return;
  }
  if (!coches.length) {
    panel.style.display = 'block';
    panel.innerHTML = `
      <h3>Alarmas</h3>
      <p class="vacio">Añade un coche para configurar tus primeras alarmas.</p>
    `;
    return;
  }
  const ahora = new Date();
  const proximas = [];
  coches.forEach(c => {
    (c.alarmas || []).forEach(a => {
      const fecha = a.fecha ? new Date(a.fecha) : null;
      const dias = fecha ? Math.ceil((fecha - ahora) / (1000 * 60 * 60 * 24)) : null;
      if (!fecha || dias === null) return;
      proximas.push({ ...a, coche: c, dias });
    });
  });
  proximas.sort((a,b) => a.dias - b.dias);
  panel.style.display = 'block';
  panel.innerHTML = `
    <h3>Alarmas próximas</h3>
    ${!proximas.length ? '<p class="vacio">No hay alarmas próximas. Configura un recordatorio desde el detalle de un coche.</p>' : `
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${proximas.slice(0,3).map(a => `<div style="padding:12px;border-radius:10px;background:#f5f8ff;border:1px solid #d7e3fa;"><strong>${a.coche.apodo || a.coche.modelo}</strong><br>${a.tipo || a.descripcion} — ${a.fecha ? new Date(a.fecha).toLocaleDateString() : 'Sin fecha'}${a.km ? ` • ${a.km} km` : ''}<br><small>${a.dias < 0 ? 'Vencida' : `En ${a.dias} día(s)`}</small></div>`).join('')}
      </div>
    `}
  `;
}

function renderAlarmas() {
  const c = getCocheById(cocheActualId);
  const bloque = document.getElementById('alarmas-lista');
  const mensaje = document.getElementById('alarmas-mensaje');
  if (!c || !bloque || !mensaje) return;
  if (!userHasAlarmas()) {
    mensaje.style.display = 'block';
    mensaje.textContent = 'Las alarmas están reservadas a planes que permiten recordatorios. Mejora tu plan para activar esta sección.';
    bloque.innerHTML = '<p class="vacio">No puedes configurar alarmas con tu plan actual.</p>';
    return;
  }
  mensaje.style.display = 'none';
  c.alarmas = c.alarmas || [];
  if (!c.alarmas.length) {
    bloque.innerHTML = '<p class="vacio">Sin alarmas aún. Configura una alarma arriba.</p>';
  } else {
    bloque.innerHTML = c.alarmas.map((a, idx) => {
      const fecha = a.fecha ? new Date(a.fecha).toLocaleDateString() : 'No definida';
      return `
        <div class="alarm-card" style="border:1px solid #e0e0e0;border-radius:10px;padding:12px;margin-bottom:10px;">
          <strong>${a.tipo || a.descripcion}</strong> • ${fecha}${a.km ? ` • ${a.km} km` : ''}
          <div style="margin-top:8px;color:#555;">${a.descripcion || 'Alarma programada'}${a.notas ? ' — ' + a.notas : ''}</div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn-secondary" style="padding:6px 12px;" onclick="abrirEdicionAlarma('${c.id}','${idx}')">Editar</button>
            <button class="btn-secondary" style="padding:6px 12px;" onclick="eliminarAlarma('${c.id}','${idx}')">Eliminar</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function eliminarAlarma(cocheId, index) {
  const c = getCocheById(cocheId);
  if (!c || !c.alarmas || !c.alarmas[index]) return;
  c.alarmas.splice(index, 1);
  guardarCocheEnParse(c).then(() => { cargarCochesUsuario(); renderAlarmas(); renderAlarmasResumen(); });
}

function abrirEdicionAlarma(cocheId, index) {
  const c = getCocheById(cocheId);
  if (!c || !c.alarmas || !c.alarmas[index]) return;
  const a = c.alarmas[index];
  if (c.compartido && getPlanKey() !== 'business') {
    return alert('Solo el plan Business puede editar alarmas en coches compartidos.');
  }
  if (c.compartido && getPlanKey() === 'business' && a.tipo !== 'aceite' && a.tipo !== 'itv') {
    return alert('En coches compartidos, solo puedes cambiar la fecha de revisión de aceite o ITV.');
  }
  document.getElementById('a-tipo').value = a.tipo || '';
  document.getElementById('a-descripcion').value = a.descripcion || '';
  document.getElementById('a-fecha').value = a.fecha || '';
  document.getElementById('a-km').value = a.km || '';
  document.getElementById('a-notas').value = a.notas || '';
  const form = document.getElementById('form-alarma');
  form.dataset.editIndex = index;
  form.dataset.editCocheId = cocheId;
  alert('Edita la fecha o kilómetros en el formulario y guarda para aplicar el cambio.');
}

function resetAlarmaForm() {
  document.getElementById('form-alarma').reset();
  delete document.getElementById('form-alarma').dataset.editIndex;
  delete document.getElementById('form-alarma').dataset.editCocheId;
}

function iniciarAlarmasListeners() {
  const form = document.getElementById('form-alarma');
  if (!form) return;
  const tipoSel = document.getElementById('a-tipo');
  if (tipoSel) {
    tipoSel.addEventListener('change', function() {
      const fechaInput = document.getElementById('a-fecha');
      const kmInput = document.getElementById('a-km');
      const descInput = document.getElementById('a-descripcion');
      if (this.value === 'aceite') {
        // Calcular próxima revisión de aceite: +12000 km o +18 meses
        const c = getCocheById(cocheActualId);
        if (c && c.mantenimientos) {
          const ultimoAceite = c.mantenimientos.filter(m => m.motivo.toLowerCase().includes('aceite')).sort((a,b) => new Date(b.fecha) - new Date(a.fecha))[0];
          if (ultimoAceite) {
            const kmProx = ultimoAceite.km + 12000;
            const fechaProx = new Date(ultimoAceite.fecha);
            fechaProx.setMonth(fechaProx.getMonth() + 18);
            fechaInput.value = fechaProx.toISOString().split('T')[0];
            kmInput.value = kmProx;
            descInput.value = 'Próxima revisión de aceite';
          } else {
            // Si no hay, sugerir en 12000 km o 18 meses desde ahora
            const ahora = new Date();
            const fechaProx = new Date(ahora);
            fechaProx.setMonth(fechaProx.getMonth() + 18);
            fechaInput.value = fechaProx.toISOString().split('T')[0];
            kmInput.value = 12000;
            descInput.value = 'Próxima revisión de aceite';
          }
        }
      } else if (this.value === 'itv') {
        descInput.value = 'Próxima ITV';
      } else {
        descInput.value = '';
      }
    });
  }
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!cocheActualId) return alert('Selecciona un coche primero.');
    if (!userHasAlarmas()) return alert('Tu plan actual no permite alarmas. Mejora para activar esta función.');
    const c = getCocheById(cocheActualId);
    if (!c) return;
    c.alarmas = c.alarmas || [];
    const tipo = document.getElementById('a-tipo').value;
    const descripcion = document.getElementById('a-descripcion').value.trim();
    const fecha = document.getElementById('a-fecha').value;
    const km = parseInt(document.getElementById('a-km').value) || null;
    const notas = document.getElementById('a-notas').value.trim();
    const alarma = { id: Date.now().toString(), tipo, descripcion, fecha: fecha || null, km, notas };

    const editIndex = form.dataset.editIndex;
    const editCocheId = form.dataset.editCocheId;
    if (editIndex !== undefined && editCocheId) {
      // Edición
      const cEdit = getCocheById(editCocheId);
      if (!cEdit || !cEdit.alarmas || !cEdit.alarmas[editIndex]) return;
      const oldAlarma = cEdit.alarmas[editIndex];
      if (cEdit.compartido && getPlanKey() === 'business') {
        // Solo cambiar fecha y km
        if (oldAlarma.tipo !== tipo || oldAlarma.descripcion !== descripcion || oldAlarma.notas !== notas) {
          return alert('En coches compartidos, solo puedes cambiar la fecha y km de la alarma.');
        }
        // Notificar al dueño
        const destinatario = cEdit.ownerId || cEdit.propietarioId;
        if (destinatario) {
          fetch('http://localhost:3000/create-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              destinatarioId: destinatario,
              mensaje: `El plan Business cambió la fecha de la alarma "${oldAlarma.descripcion}" en tu coche compartido.`
            })
          }).catch(console.error);
        }
      }
      cEdit.alarmas[editIndex] = { ...oldAlarma, fecha, km };
      guardarCocheEnParse(cEdit).then(() => {
        cargarCochesUsuario();
        resetAlarmaForm();
        renderAlarmas();
        renderAlarmasResumen();
        alert('Alarma actualizada.');
      });
    } else {
      // Nueva
      c.alarmas.push(alarma);
      guardarCocheEnParse(c).then(() => {
        cargarCochesUsuario();
        resetAlarmaForm();
        renderAlarmas();
        renderAlarmasResumen();
        if (!document.getElementById('tab-alarmas').classList.contains('oculto')) {
          document.getElementById('tab-alarmas').classList.remove('oculto');
        }
        alert('Alarma guardada. Se enviará una notificación en la app cuando se acerque la fecha.');
      });
    }
  });
  const btnReset = document.getElementById('btn-reset-alarma');
  if (btnReset) btnReset.addEventListener('click', resetAlarmaForm);
}

function verificarNotifAlarmas() {
  if (!userHasAlarmas()) return;
  const ahora = new Date();
  coches.forEach(c => {
    (c.alarmas || []).forEach(a => {
      if (!a.fecha || a.notificado) return;
      const fecha = new Date(a.fecha);
      const dias = Math.ceil((fecha - ahora) / (1000 * 60 * 60 * 24));
      if (dias <= 7 && dias >= 0) {
        // Enviar email
        fetch('http://localhost:3000/send-alarm-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: usuarioActual.get('email'),
            coche: c.apodo || c.modelo,
            alarma: a,
            dias
          })
        }).then(() => {
          a.notificado = true;
          guardarCocheEnParse(c);
        }).catch(e => console.warn('Error enviando notificación:', e));
      }
    });
  });
}

// ===== BANDEJA DE NOTIFICACIONES =====
async function mostrarBandejaNotificaciones() {
  cerrarTodosLosModales();
  document.getElementById('modal-bandeja-notificaciones').classList.remove('oculto');
  await cargarNotificaciones();
}

async function cargarNotificaciones() {
  if (!usuarioActual) return;
  try {
    const response = await fetch(`http://localhost:3000/get-notifications/${usuarioActual.id}`);
    const data = await response.json();
    if (data.success) {
      const lista = document.getElementById('lista-notificaciones');
      lista.innerHTML = '';
      if (!data.notifications.length) {
        lista.innerHTML = '<p class="vacio">No hay notificaciones nuevas.</p>';
      } else {
        data.notifications.forEach(n => {
          const item = document.createElement('div');
          item.className = 'notif-item';
          item.style.border = '1px solid #e0e0e0';
          item.style.borderRadius = '8px';
          item.style.padding = '12px';
          item.style.marginBottom = '8px';
          item.style.background = '#f9f9f9';
          item.innerHTML = `
            <p style="margin:0 0 8px 0;font-weight:500;">${n.mensaje}</p>
            <small style="color:#666;">${new Date(n.fecha).toLocaleString()}</small>
            <div style="margin-top:8px;text-align:right;">
              <button onclick="marcarLeida('${n.id}')" class="btn-secondary" style="padding:4px 8px;font-size:0.8rem;">Marcar leída</button>
            </div>
          `;
          lista.appendChild(item);
        });
      }
      actualizarBadgeNotificaciones(data.notifications.length);
    }
  } catch (e) {
    console.error('Error cargando notificaciones:', e);
  }
}

async function marcarLeida(notifId) {
  try {
    await fetch(`http://localhost:3000/mark-notification-read/${notifId}`, { method: 'POST' });
    await cargarNotificaciones();
  } catch (e) {
    console.error('Error marcando leída:', e);
  }
}

function actualizarBadgeNotificaciones(count) {
  const badge = document.getElementById('badge-notificaciones');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// ===== SUBMIT FORM COCHE (llamado por botón onclick) =====
function submitFormCoche() {
  const marcaVal    = document.getElementById('marca').value;
  const marcaCustom = document.getElementById('marca-custom').value.trim();
  const modeloVal   = document.getElementById('modelo').value;
  const modeloCustom = document.getElementById('modelo-custom').value.trim();
  const anioVal     = document.getElementById('anio').value;
  const apodoVal    = document.getElementById('apodo').value.trim();

  const marcaFinal  = (marcaVal === '__otro__')  ? marcaCustom  : marcaVal;
  const modeloFinal = (modeloVal === '__otro__') ? modeloCustom : modeloVal;

  if (!marcaFinal || !modeloFinal) return alert('Marca y modelo son obligatorios');

  const esSugerencia = (marcaVal === '__otro__' || modeloVal === '__otro__');
  const plan = getPlan();
  const limiteCoches = plan.coches || 0;
  if (coches.length >= limiteCoches) {
    return alert(`Tu plan actual solo permite ${limiteCoches} coche${limiteCoches === 1 ? '' : 's'}. Cambia de plan para añadir más.`);
  }

  const id = Date.now().toString();
  const c = {
    id, marca: marcaFinal, modelo: modeloFinal,
    anio: anioVal || '', apodo: apodoVal,
    mantenimientos: [], referencias: [], esSugerencia
  };

  guardarCocheEnParse(c).then(() => {
    if (esSugerencia) enviarSugerencia(marcaFinal, modeloFinal, anioVal, id);
    cargarCochesUsuario();
    document.getElementById('modal-coche').classList.add('oculto');
    document.getElementById('form-coche').reset();
    document.getElementById('modelo-custom').classList.add('oculto');
    document.getElementById('marca-custom').classList.add('oculto');
    document.getElementById('aviso-sugerencia').classList.add('oculto');
  }).catch(e => alert('Error al guardar: ' + e.message));
}

// ===== MODAL TRANSFERENCIAS RECIBIDAS =====
function mostrarModalTransferencias() {
  cerrarTodosLosModales();
  document.getElementById('modal-lista-transferencias').classList.remove('oculto');
  cargarTransferenciasRecibidas();
}

// Actualizar badge de transferencias en el header
window.actualizarBadgeTransferencias = async function() {
  const user = Parse.User.current();
  if (!user) return;
  try {
    const Transf = Parse.Object.extend('SolicitudTransferencia');
    const q = new Parse.Query(Transf);
    q.equalTo('destinoId', user.id);
    q.equalTo('estado', 'pendiente');
    const count = await q.count();
    const badge = document.getElementById('badge-transferencias');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch(e) {}
};