// ===== TRANSFERENCIAS DE COCHES =====
// Planes que pueden ENVIAR una transferencia: pro, premium, business
const PLANES_PUEDEN_TRANSFERIR = ['pro', 'premium', 'business'];

// Clase Parse para solicitudes de transferencia
const CLS_TRANSF = 'SolicitudTransferencia';

// ---- Abrir modal de transferencia ----
window.abrirModalTransferencia = function() {
  console.log('[App] abrirModalTransferencia invoked, cocheActualId=', cocheActualId);
  cerrarTodosLosModales();
  const user = Parse.User.current();
  if (!user) return alert('Debes iniciar sesión.');
  const plan = user.get('plan') || 'free';
  if (!PLANES_PUEDEN_TRANSFERIR.includes(plan)) {
    return alert('Necesitas el plan Pro o superior para transferir un coche.');
  }
  const c = getCocheById(cocheActualId);
  if (!c) {
    return alert('Selecciona primero el coche que quieres transferir.');
  }
  document.getElementById('transf-coche-nombre').textContent =
    (c.apodo || c.marca + ' ' + c.modelo) + ' (' + c.anio + ')';
  document.getElementById('transf-email').value = '';
  document.getElementById('transf-error').textContent = '';
  document.getElementById('transf-error').classList.add('oculto');
  document.getElementById('modal-transferencia').classList.remove('oculto');
};

// ---- Enviar solicitud de transferencia ----
window.enviarTransferencia = async function() {
  const emailDestino = document.getElementById('transf-email').value.trim().toLowerCase();
  const errEl = document.getElementById('transf-error');
  errEl.textContent = ''; errEl.classList.add('oculto');

  if (!emailDestino) {
    errEl.textContent = 'Escribe el correo del destinatario.'; errEl.classList.remove('oculto'); return;
  }

  const user = Parse.User.current();
  if (!user) return;

  // No puede transferirse a si mismo
  if (emailDestino === (user.get('email') || '').toLowerCase()) {
    errEl.textContent = 'No puedes transferirte el coche a ti mismo.'; errEl.classList.remove('oculto'); return;
  }

    const c = getCocheById(cocheActualId);
  if (!c) return;

  // Buscar usuario destino por email en el servidor local
  try {
    const resp = await fetch('http://localhost:3000/find-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailDestino })
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) {
      errEl.textContent = data.error || 'No existe ninguna cuenta con ese correo.';
      errEl.classList.remove('oculto');
      return;
    }
    const destino = data.user;

    // Comprobar si ya hay una transferencia pendiente para este coche
    const qExist = new Parse.Query(Parse.Object.extend(CLS_TRANSF));
    qExist.equalTo('cocheId', c.id);
    qExist.equalTo('estado', 'pendiente');
    const existe = await qExist.first();
    if (existe) {
      errEl.textContent = 'Ya hay una transferencia pendiente para este coche.'; errEl.classList.remove('oculto'); return;
    }

    // Crear solicitud
    const Transf = Parse.Object.extend(CLS_TRANSF);
    const sol = new Transf();
    sol.set('emisorId',     user.id);
    sol.set('emisorEmail',  user.get('email') || user.get('username'));
    sol.set('emisorApodo',  user.get('apodo')  || user.get('email'));
    sol.set('destinoId',    destino.id);
    sol.set('destinoEmail', emailDestino);
    sol.set('cocheId',      c.id);
    sol.set('cocheDatos',   Object.assign({}, c));
    sol.set('estado',       'pendiente');
    // ACL: solo emisor y destino pueden leer
    const acl = new Parse.ACL();
    acl.setReadAccess(user.id, true);
    acl.setWriteAccess(user.id, true);
    acl.setReadAccess(destino.id, true);
    acl.setWriteAccess(destino.id, true);
    sol.setACL(acl);
    await sol.save();

    document.getElementById('modal-transferencia').classList.add('oculto');
    alert('Solicitud enviada. El destinatario debe aceptarla desde la app.');
  } catch(e) {
    errEl.textContent = 'Error: ' + (e.message || e); errEl.classList.remove('oculto');
  }
};

// ---- Cargar solicitudes de transferencia recibidas ----
window.cargarTransferenciasRecibidas = async function() {
  const user = Parse.User.current();
  if (!user) return;
  const lista = document.getElementById('lista-transferencias');
  if (!lista) return;
  try {
    const Transf = Parse.Object.extend(CLS_TRANSF);
    const q = new Parse.Query(Transf);
    q.equalTo('destinoId', user.id);
    q.equalTo('estado', 'pendiente');
    q.descending('createdAt');
    const res = await q.find();
    if (!res.length) {
      lista.innerHTML = '<p style="color:#888;font-size:0.9rem;">Sin transferencias pendientes.</p>';
      return;
    }
    lista.innerHTML = res.map(sol => {
      const d = sol.get('cocheDatos') || {};
      const nombre = d.apodo || (d.marca + ' ' + d.modelo) || 'Coche';
      const emisor = sol.get('emisorApodo') || sol.get('emisorEmail');
      return `
        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div>
            <div style="font-weight:600;">🚗 ${nombre}</div>
            <div style="font-size:0.82rem;color:#666;">${d.marca || ''} ${d.modelo || ''} ${d.anio ? '(' + d.anio + ')' : ''}</div>
            <div style="font-size:0.8rem;color:#888;">De: ${emisor}</div>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="aceptarTransferencia('${sol.id}')" class="btn-primary" style="padding:6px 14px;font-size:0.85rem;">✅ Aceptar</button>
            <button onclick="rechazarTransferencia('${sol.id}')" class="btn-secondary" style="padding:6px 14px;font-size:0.85rem;">❌ Rechazar</button>
          </div>
        </div>`;
    }).join('');
  } catch(e) {
    lista.innerHTML = '<p style="color:red;">Error al cargar transferencias.</p>';
  }
};

// ---- Aceptar transferencia ----
window.aceptarTransferencia = async function(solId) {
  if (!confirm('Al aceptar, el coche y todos sus datos pasaran a tu cuenta. El dueno anterior lo perdera. ¿Aceptas?')) return;
  const user = Parse.User.current();
  if (!user) return;
  try {
    const Transf = Parse.Object.extend(CLS_TRANSF);
    const q = new Parse.Query(Transf);
    const sol = await q.get(solId);
    if (sol.get('estado') !== 'pendiente') return alert('Esta transferencia ya no esta disponible.');

    const datosOriginales = sol.get('cocheDatos') || {};
    const emisorId = sol.get('emisorId');

    // 1. Eliminar el coche del emisor en Parse
    const CocheUsuario = Parse.Object.extend('CocheUsuario');
    const qCoche = new Parse.Query(CocheUsuario);
    qCoche.equalTo('usuario', { __type: 'Pointer', className: '_User', objectId: emisorId });
    const cocheEmisores = await qCoche.find();
    const cocheParseObj = cocheEmisores.find(obj => {
      const d = obj.get('datos') || {};
      return d.id === datosOriginales.id;
    });
    if (cocheParseObj) await cocheParseObj.destroy();

    // 2. Crear el coche en la cuenta del destinatario
    const nuevoCoche = new CocheUsuario();
    nuevoCoche.set('usuario', user);
    const acl = new Parse.ACL(user);
    acl.setPublicReadAccess(false);
    nuevoCoche.setACL(acl);
    const nuevosDatos = Object.assign({}, datosOriginales);
    delete nuevosDatos._parseId;
    nuevosDatos.id = Date.now().toString(); // nuevo id local
    nuevoCoche.set('datos', nuevosDatos);
    await nuevoCoche.save();

    // 3. Marcar solicitud como aceptada
    sol.set('estado', 'aceptada');
    await sol.save();

    alert('Coche recibido correctamente. Ya aparece en tu lista.');
    cargarCochesUsuario();
    cargarTransferenciasRecibidas();
  } catch(e) {
    alert('Error al aceptar: ' + (e.message || e));
  }
};

// ---- Rechazar transferencia ----
window.rechazarTransferencia = async function(solId) {
  if (!confirm('¿Rechazar esta transferencia?')) return;
  try {
    const Transf = Parse.Object.extend(CLS_TRANSF);
    const q = new Parse.Query(Transf);
    const sol = await q.get(solId);
    sol.set('estado', 'rechazada');
    await sol.save();
    cargarTransferenciasRecibidas();
  } catch(e) {
    alert('Error: ' + (e.message || e));
  }
};